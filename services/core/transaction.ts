// TODO typing external packages
/* eslint-disable */

import Jszip from 'jszip'
import { BigNumber, ethers } from 'ethers'
import MerkleTree from 'fixed-merkle-tree'
import axios, { AxiosResponse } from 'axios'
import { BytesLike } from '@ethersproject/bytes'

import { APP_ENS_NAME, BG_ZERO, FIELD_SIZE, numbers, ZERO_LEAF } from '@/constants'

import {
  ArgsProof,
  ProofParams,
  DownloadParams,
  FetchFileParams,
  InputFileFormat,
  PrepareTxParams,
  EstimateTransactParams,
  CreateTransactionParams,
} from './@types'

import { Utxo } from './utxo'
import { prove } from './prover'
import { toFixedHex, poseidonHash2, getExtDataHash, shuffle } from './utils'

import { getProvider, Keypair, workerProvider } from '@/services'
import { commitmentsFactory } from '@/services/commitments'
import { CommitmentEvents } from '@/services/events/@types'

import { ChainId } from '@/types'
import { getTornadoPool } from '@/contracts'
import { Element } from 'fixed-merkle-tree'
import { proveInclusion } from './poi'
import { TxRecord } from './txRecord'
import { getIPFSCid } from '@/utilities/getIPFSCid'
import { saveAsFile } from '@/utilities'

const ADDRESS_BYTES_LENGTH = 20

const jszip = new Jszip()

export const poseidonHash2Wrapper = (left: Element, right: Element) => toFixedHex(poseidonHash2(left.toString(), right.toString()))

function buildMerkleTree({ events }: { events: CommitmentEvents }) {
  const leaves = events.sort((a, b) => a.index - b.index).map((e) => toFixedHex(e.commitment))
  return new MerkleTree(numbers.MERKLE_TREE_HEIGHT, leaves, { hashFunction: poseidonHash2Wrapper, zeroElement: ZERO_LEAF.toString() })
}

async function getProof({
  inputs,
  isL1Withdrawal,
  l1Fee,
  outputs,
  tree,
  extAmount,
  fee,
  recipient,
  relayer,
  membershipProofURI,
}: ProofParams) {
  console.log('GET PROOF IS CALLED')
  console.log(extAmount)
  // inputs = shuffle(inputs)
  // outputs = shuffle(outputs)

  const inputMerklePathIndices = []
  const inputMerklePathElements = []

  for (const input of inputs) {
    if (input.amount.gt(numbers.ZERO)) {
      input.index = tree.indexOf(toFixedHex(input.getCommitment()))

      if (input.index < numbers.ZERO) {
        throw new Error(`Input commitment ${toFixedHex(input.getCommitment())} was not found`)
      }
      inputMerklePathIndices.push(input.index)
      inputMerklePathElements.push(tree.path(input.index).pathElements)
    } else {
      inputMerklePathIndices.push(numbers.ZERO)
      inputMerklePathElements.push(new Array(numbers.MERKLE_TREE_HEIGHT).fill(numbers.ZERO))
    }
  }
  // console.log(JSON.stringify(inputMerklePathIndices))
  // console.log(JSON.stringify(inputMerklePathElements))
  console.log('MERKLE TREE STATS:::::::::::::')
  console.log(tree.root)
  console.log(tree.elements)
  console.log(tree.zeros)
  console.log(tree.layers)

  const [output1, output2] = outputs
  console.log('Calculating extAmount:')
  console.log(extAmount)
  console.log(toFixedHex(extAmount))
  const extData = {
    recipient: toFixedHex(recipient, ADDRESS_BYTES_LENGTH),
    extAmount: toFixedHex(extAmount),
    relayer: toFixedHex(relayer, ADDRESS_BYTES_LENGTH),
    fee: toFixedHex(fee),
    encryptedOutput1: output1.encrypt(),
    encryptedOutput2: output2.encrypt(),
    membershipProofURI: membershipProofURI,
  }

  const extDataHash = getExtDataHash(extData)

  const input = {
    root: typeof tree === 'string' ? tree : tree.root,
    inputNullifier: inputs.map((x) => x.getNullifier()),
    outputCommitment: outputs.map((x) => x.getCommitment()),
    publicAmount: BigNumber.from(extAmount).sub(fee).add(FIELD_SIZE).mod(FIELD_SIZE).toString(),
    extDataHash,

    // data for 2 transaction inputs
    inAmount: inputs.map((x) => x.amount),
    inPrivateKey: inputs.map((x) => x.keypair.privkey),
    inBlinding: inputs.map((x) => x.blinding),
    inPathIndices: inputMerklePathIndices,
    inPathElements: inputMerklePathElements,

    // data for 2 transaction outputs
    outAmount: outputs.map((x) => x.amount),
    outBlinding: outputs.map((x) => x.blinding),
    outPubkey: outputs.map((x) => x.keypair.pubkey),
  }

  // @ts-ignore
  const prefix = __webpack_public_path__.slice(0, -7)

  const wasmKey = await download({
    prefix,
    name: `transaction${inputs.length}.wasm.zip`,
    contentType: 'nodebuffer',
  })
  const zKey = await download({
    prefix,
    name: `transaction${inputs.length}.zkey.zip`,
    contentType: 'nodebuffer',
  })

  // @ts-ignore
  const proof = await prove(input, wasmKey, zKey)

  const args: ArgsProof = {
    proof,
    root: toFixedHex(input.root),
    inputNullifiers: inputs.map((x) => toFixedHex(x.getNullifier())) as [string, string],
    outputCommitments: outputs.map((x) => toFixedHex(x.getCommitment())) as [BytesLike, BytesLike],
    publicAmount: toFixedHex(input.publicAmount),
    extDataHash: toFixedHex(extDataHash),
  }

  return {
    extData,
    proof,
    args,
  }
}

async function prepareTransaction({
  events = [],
  inputs = [],
  rootHex = '',
  outputs = [],
  fee = BG_ZERO,
  l1Fee = BG_ZERO,
  relayer = BG_ZERO,
  recipient = BG_ZERO,
  isL1Withdrawal = true,
  membershipProofURI = '',
}: PrepareTxParams) {
  if (inputs.length > numbers.INPUT_LENGTH_2 || outputs.length > numbers.INPUT_LENGTH_2) {
    throw new Error('Incorrect inputs/outputs count')
  }
  while (inputs.length < numbers.INPUT_LENGTH_2) {
    inputs.push(new Utxo())
  }
  while (outputs.length < numbers.INPUT_LENGTH_2) {
    outputs.push(new Utxo())
  }

  let extAmount = BigNumber.from(fee)
    .add(outputs.reduce((sum, x) => sum.add(x.amount), BG_ZERO))
    .sub(inputs.reduce((sum, x) => sum.add(x.amount), BG_ZERO))
  console.log('EXT AMOUNT IS: ', extAmount)

  const amount = extAmount.gt(0) ? extAmount : BG_ZERO

  let params: ProofParams = {
    inputs,
    outputs,
    isL1Withdrawal,
    extAmount,
    tree: rootHex,
    fee,
    l1Fee,
    recipient,
    relayer,
    membershipProofURI,
  }

  if (!rootHex) {
    params.tree = await buildMerkleTree({ events })
  }

  // console.log("NEW EXPERIMENT IS COMING")
  // const mt = await buildMerkleTree({ events: [] })
  // console.log("NEW EXPERIMENT IS COMING")
  // console.log(mt.root)
  // console.log(mt.insert(ZERO_LEAF.toString()))
  // console.log(mt.path(0).pathElements)

  // console.log('Builded merkle tree: ', params.tree)
  // console.log('Builded trees root: ', params.tree.root)

  const { extData, args } = await getProof(params)

  return {
    extData,
    args,
    amount,
  }
}

// async function getIPFSIdFromENS(ensName: string) {
//   const { provider } = getProvider(ChainId.MAINNET)
//   const resolver = await provider.getResolver(ensName)
//   if (!resolver) {
//     console.error(`Cannot fetch ENS resolver for ${ensName}`)
//     return ''
//   }

//   const cHash = await resolver.getContentHash()
//   const [, id] = cHash.split('://')

//   return id
// }

async function fetchFile<T>({ url, name, id, retryAttempt = numbers.ZERO }: FetchFileParams): Promise<AxiosResponse<T>> {
  try {
    const response = await axios.get<T>(`${url}/${name}`, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return response
  } catch (err) {
    if (!id) {
      // id = await getIPFSIdFromENS(APP_ENS_NAME)
      throw new Error('id is not defined, Cannot fetch proving keys, please check your internet connection or try to use VPN.')
    }

    const knownResources = [url, `https://ipfs.io/ipfs/${id}`, `https://dweb.link/ipfs/${id}`, `https://gateway.pinata.cloud/ipfs/${id}`]

    if (retryAttempt < knownResources.length) {
      const fallbackUrl = knownResources[retryAttempt]
      retryAttempt++

      const response = await fetchFile<T>({ name, retryAttempt, id, url: fallbackUrl })

      return response
    }
    throw err
  }
}

async function download({ prefix, name, contentType }: DownloadParams) {
  try {
    const response = await fetchFile<InputFileFormat>({ name, url: prefix })

    const zip = await jszip.loadAsync(response.data)
    const file = zip.file(name.slice(0, -4))

    if (file) {
      // @ts-ignore
      return await file.async(contentType)
    }

    return undefined
  } catch (err) {
    throw new Error('Cannot fetch proving keys, please check your internet connection or try to use VPN.')
  }
}

async function estimateTransact(payload: EstimateTransactParams) {
  try {
    const tornadoPool = getTornadoPool(ChainId.ETHEREUM_GOERLI)

    const gas = await tornadoPool.estimateGas.transact(payload.args, payload.extData, {
      from: tornadoPool.address,
    })

    return gas
  } catch (err) {
    console.error('estimateTransact has error:', err.message)
    throw new Error(
      `Looks like you are accessing an outdated version of the user interface. Reload page or try an alternative gateway. If that doesn't work please contact support`
    )
  }
}

async function createTransactionData(params: CreateTransactionParams, keypair: Keypair) {
  try {
    let membershipProof
    const commitmentsService = commitmentsFactory.getService(ChainId.ETHEREUM_GOERLI)
    params.outputs = params.outputs || []
    while (params.outputs.length < 2) {
      params.outputs.push(new Utxo({ keypair }))
    }
    params.inputs = params.inputs || []
    while (params.inputs.length < 2) {
      const newBlinding = BigNumber.from(
        '0x' +
          ethers.utils
            .keccak256(
              ethers.utils.concat([ethers.utils.arrayify(ZERO_LEAF), ethers.utils.arrayify(params.outputs[params.inputs.length].blinding)])
            )
            .slice(2, 64)
      ).mod(FIELD_SIZE)

      const newUtxo = new Utxo({ amount: BG_ZERO, keypair, blinding: newBlinding, index: 0 })
      params.inputs.push(newUtxo)
    }

    if (params.recipient) {
      const txRecordEvents = await workerProvider.getTxRecordEvents()
      console.log('TX RECORD EVENTS: ', txRecordEvents)
      params.events = await commitmentsService.fetchCommitments(keypair)

      params.fee = params.fee || BG_ZERO
      let extAmount = BigNumber.from(params.fee)
        .add(params.outputs.reduce((sum, x) => sum.add(x.amount), BG_ZERO))
        .sub(params.inputs.reduce((sum, x) => sum.add(x.amount), BG_ZERO))

      const publicAmount = BigNumber.from(extAmount).sub(params.fee).add(FIELD_SIZE).mod(FIELD_SIZE).toString()
      const finalTxRecord = new TxRecord({
        publicAmount,
        inputs: params.inputs,
        outputs: params.outputs,
      })
      console.log('FINAL TX RECORD: ', finalTxRecord)
      console.log('COMMITMENTS: ', params.events)

      const membershipProofInputs = await proveInclusion(keypair, params, {
        txRecordEvents,
        nullifierToUtxo: undefined,
        commitmentToUtxo: undefined,
        finalTxRecord: finalTxRecord,
      })
      const inputjson = JSON.stringify(membershipProofInputs)
      const startjson = JSON.stringify({ step_in: [BigNumber.from(membershipProofInputs[0].step_in).toHexString()] })
      console.log('inputjson', inputjson)
      console.log('startjson', startjson)
      await workerProvider.generate_public_parameters()
      membershipProof = await workerProvider.prove_membership(inputjson, startjson)
      const membershipProofJSON = JSON.parse(membershipProof)
      console.log('MEMBERSHIP PROOF: ', membershipProofJSON)
      params.membershipProofURI = await getIPFSCid(JSON.stringify(membershipProofJSON))
      saveAsFile(JSON.stringify(membershipProofJSON), 'membership_proof_save_to_ipfs_if_you_dont_trust_relayers_pinning_service.txt')
    }
    params.events = await commitmentsService.fetchCommitments(keypair)

    const { extData, args, amount } = await prepareTransaction(params)

    return { extData, args, amount, membershipProof }
  } catch (err) {
    throw new Error(err.message)
  }
}

export { createTransactionData }
