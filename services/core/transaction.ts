// TODO typing external packages
/* eslint-disable */

import Jszip from 'jszip'
import { BigNumber } from 'ethers'
// @ts-expect-error
import MerkleTree from '@tornado/fixed-merkle-tree'
import axios, { AxiosResponse } from 'axios'
import { BytesLike } from '@ethersproject/bytes'

import { APP_ENS_NAME, BG_ZERO, FIELD_SIZE, numbers } from '@/constants'

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

import { getProvider, Keypair } from '@/services'
import { commitmentsFactory } from '@/services/commitments'
import { CommitmentEvents } from '@/services/events/@types'

import { ChainId } from '@/types'
import { getTornadoPool } from '@/contracts'

const ADDRESS_BYTES_LENGTH = 20

const jszip = new Jszip()

function buildMerkleTree({ events }: { events: CommitmentEvents }): typeof MerkleTree {
  const leaves = events.sort((a, b) => a.index - b.index).map((e) => toFixedHex(e.commitment))
  return new MerkleTree(numbers.MERKLE_TREE_HEIGHT, leaves, { hashFunction: poseidonHash2 })
}

async function getProof({ inputs, isL1Withdrawal, l1Fee, outputs, tree, extAmount, fee, recipient, relayer }: ProofParams) {
  inputs = shuffle(inputs)
  outputs = shuffle(outputs)

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

  const [output1, output2] = outputs

  const extData = {
    recipient: toFixedHex(recipient, ADDRESS_BYTES_LENGTH),
    extAmount: toFixedHex(extAmount),
    relayer: toFixedHex(relayer, ADDRESS_BYTES_LENGTH),
    fee: toFixedHex(fee),
    encryptedOutput1: output1.encrypt(),
    encryptedOutput2: output2.encrypt(),
    isL1Withdrawal,
    l1Fee: toFixedHex(l1Fee),
  }

  const extDataHash = getExtDataHash(extData)

  const input = {
    root: typeof tree === 'string' ? tree : tree.root(),
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
    inputNullifiers: inputs.map((x) => toFixedHex(x.getNullifier())),
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
}: PrepareTxParams) {
  if (inputs.length > numbers.INPUT_LENGTH_16 || outputs.length > numbers.INPUT_LENGTH_2) {
    throw new Error('Incorrect inputs/outputs count')
  }
  while (inputs.length !== numbers.INPUT_LENGTH_2 && inputs.length < numbers.INPUT_LENGTH_16) {
    inputs.push(new Utxo())
  }
  while (outputs.length < numbers.INPUT_LENGTH_2) {
    outputs.push(new Utxo())
  }

  let extAmount = BigNumber.from(fee)
    .add(outputs.reduce((sum, x) => sum.add(x.amount), BG_ZERO))
    .sub(inputs.reduce((sum, x) => sum.add(x.amount), BG_ZERO))

  const amount = extAmount.gt(0) ? extAmount : BG_ZERO

  let params = {
    inputs,
    outputs,
    isL1Withdrawal,
    extAmount,
    tree: rootHex,
    fee,
    l1Fee,
    recipient,
    relayer,
  }

  if (!rootHex) {
    params.tree = await buildMerkleTree({ events })
  }

  const { extData, args } = await getProof(params)

  return {
    extData,
    args,
    amount,
  }
}

async function getIPFSIdFromENS(ensName: string) {
  const { provider } = getProvider(ChainId.MAINNET)
  const resolver = await provider.getResolver(ensName)
  if (!resolver) {
    console.error(`Cannot fetch ENS resolver for ${ensName}`)
    return ''
  }

  const cHash = await resolver.getContentHash()
  const [, id] = cHash.split('://')

  return id
}

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
      id = await getIPFSIdFromENS(APP_ENS_NAME)
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
    const tornadoPool = getTornadoPool(ChainId.XDAI)

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
    const tornadoPool = getTornadoPool(ChainId.XDAI)

    if (!params.inputs || !params.inputs.length) {
      const root = await tornadoPool.callStatic.getLastRoot()

      params.events = []
      params.rootHex = toFixedHex(root)
    } else {
      const commitmentsService = commitmentsFactory.getService(ChainId.XDAI)

      params.events = await commitmentsService.fetchCommitments(keypair)
    }

    const { extData, args, amount } = await prepareTransaction(params)

    await estimateTransact({ extData, args })

    return { extData, args, amount }
  } catch (err) {
    throw new Error(err.message)
  }
}

export { createTransactionData }
