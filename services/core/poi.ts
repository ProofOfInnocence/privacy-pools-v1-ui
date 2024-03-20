import { BG_ZERO, FIELD_SIZE, ZERO_LEAF, numbers } from '@/constants'
import { BaseUtxo, PrepareTxParams, ProveInclusionParams } from './@types'
import { CommitmentEvents, TxRecordEvents } from '../events/@types'
import { Utxo } from './utxo'
import { Keypair } from './keypair'
import { toFixedHex } from './utils'
import { BigNumber, ethers } from 'ethers'
import { TxRecord } from './txRecord'
import MerkleTree from 'fixed-merkle-tree'
import { poseidonHash2Wrapper } from './transaction'
// @ts-expect-error
import { utils } from 'ffjavascript'

function buildTxRecordMerkleTree({ events }: { events: TxRecordEvents }) {
  const leaves = events.sort((a, b) => a.index - b.index).map((e) => toFixedHex(TxRecord.hashFromEvent(e)))
  return new MerkleTree(numbers.TX_RECORDS_MERKLE_TREE_HEIGHT, leaves, { hashFunction: poseidonHash2Wrapper, zeroElement: ZERO_LEAF.toString() })
}

async function buildMappings(keypair: Keypair, commitmentEvents: CommitmentEvents, txRecordEvents: TxRecordEvents) {
  const commitmentToUtxo = new Map<string, BaseUtxo>()
  const nullifierToUtxo = new Map<string, BaseUtxo>()
  for (const event of commitmentEvents) {
    let decryptedUtxo = null
    try {
      decryptedUtxo = Utxo.decrypt(keypair, event.encryptedOutput, event.index)
    } catch (e) {
      continue
    }
    const currentNullifier = toFixedHex(decryptedUtxo.getNullifier())
    nullifierToUtxo.set(currentNullifier, decryptedUtxo)
    commitmentToUtxo.set(toFixedHex(event.commitment), decryptedUtxo)
  }

  for (const event of txRecordEvents) {
    function findBlindingForNullifier(trivialNullifier: string, commitment: string) {
      trivialNullifier = toFixedHex(trivialNullifier)
      commitment = toFixedHex(commitment)
      console.log("Trying to find blinding for nullifier = ", trivialNullifier, " commitment = ", commitment);

      if (!commitmentToUtxo.has(commitment)) {
        console.log("Apparently we don't have commitment = ", commitment, " in commitmentToUtxo");
        return
      }
      if (nullifierToUtxo.has(trivialNullifier)) {
        console.log("Apparently we already have nullifier = ", trivialNullifier, " in nullifierToUtxo");
        return
      }
      const utxo = commitmentToUtxo.get(commitment)
      if (!utxo) {
        throw new Error('Please erase your cache and refresh this page.')
      }
      const newBlinding = BigNumber.from(
        '0x' +
        ethers.utils.keccak256(ethers.utils.concat([ethers.utils.arrayify(ZERO_LEAF), ethers.utils.arrayify(utxo.blinding)])).slice(2, 64)
      ).mod(FIELD_SIZE)

      const newUtxo = new Utxo({ amount: BG_ZERO, keypair, blinding: newBlinding, index: 0 })
      nullifierToUtxo.set(toFixedHex(newUtxo.getNullifier()), newUtxo)
      console.log('newly generated nullifier = ', toFixedHex(newUtxo.getNullifier()))
      console.log('trivial nullifier = ', trivialNullifier)
      if (toFixedHex(newUtxo.getNullifier()) != trivialNullifier) {
        throw new Error('Please erase your cache and refresh this page...')
      }
    }
    findBlindingForNullifier(event.inputNullifier1, event.outputCommitment1)
    findBlindingForNullifier(event.inputNullifier2, event.outputCommitment2)
  }

  return { nullifierToUtxo, commitmentToUtxo }
}

async function getPoiSteps({
  txRecordEvents,
  nullifierToUtxo = undefined,
  commitmentToUtxo = undefined,
  finalTxRecord,
}: ProveInclusionParams) {
  if (!nullifierToUtxo || !commitmentToUtxo) {
    throw new Error('nullifierToUtxo and commitmentToUtxo must be defined')
  }
  let txRecords = []
  for (const event of txRecordEvents) {
    console.log("TX RECORD EVENT:", event);
    
    const input1 = nullifierToUtxo.get(toFixedHex(event.inputNullifier1))
    if (!input1) {
      continue
    }
    const input2 = nullifierToUtxo.get(toFixedHex(event.inputNullifier2))
    if (!input2) {
      throw new Error('Should not happen3')
    }
    const output1 = commitmentToUtxo.get(toFixedHex(event.outputCommitment1))
    if (!output1) {
      throw new Error('Should not happen4')
    }
    const output2 = commitmentToUtxo.get(toFixedHex(event.outputCommitment2))
    if (!output2) {
      throw new Error('Should not happen5')
    }
    const _txRecord = new TxRecord({
      inputs: [input1, input2],
      outputs: [output1, output2],
      publicAmount: event.publicAmount,
      index: event.index,
      txHash: event.transactionHash,
    })
    txRecords.push(_txRecord)
  }

  let steps = [finalTxRecord]
  const todoProve = new Set()
  if (finalTxRecord.inputs[0].amount.gt(0)) {
    todoProve.add(toFixedHex(finalTxRecord.inputs[0].getCommitment()))
  }
  if (finalTxRecord.inputs[1].amount.gt(0)) {
    todoProve.add(toFixedHex(finalTxRecord.inputs[1].getCommitment()))
  }

  txRecords = txRecords.filter((x) => (x.index < finalTxRecord.index ? finalTxRecord.index : x.index + 1))
  txRecords.sort((a, b) => b.index - a.index)
  console.log("TX RECORDS:", txRecords);


  for (const txRecord of txRecords) {
    if (
      (txRecord.outputs[0].amount.gt(0) && todoProve.has(toFixedHex(txRecord.outputs[0].getCommitment()))) ||
      (txRecord.outputs[1].amount.gt(0) && todoProve.has(toFixedHex(txRecord.outputs[1].getCommitment())))
    ) {
      todoProve.delete(toFixedHex(txRecord.outputs[0].getCommitment()))
      todoProve.delete(toFixedHex(txRecord.outputs[1].getCommitment()))

      if (txRecord.inputs[0].amount.gt(0)) {
        todoProve.add(toFixedHex(txRecord.inputs[0].getCommitment()))
      }
      if (txRecord.inputs[1].amount.gt(0)) {
        todoProve.add(toFixedHex(txRecord.inputs[1].getCommitment()))
      }
      steps.push(txRecord)
    }
  }

  if (todoProve.size > 0) {
    throw new Error('Not enough proofs')
  }
  return steps.reverse()
}

async function proveInclusion(
  keypair: Keypair,
  {
    events = [],
    inputs = [],
    rootHex = '',
    outputs = [],
    fee = BG_ZERO,
    l1Fee = BG_ZERO,
    relayer = BG_ZERO,
    recipient = BG_ZERO,
    isL1Withdrawal = true,
    membershipProofURI = ""
  }: PrepareTxParams,
  { txRecordEvents, associationSet, nullifierToUtxo = undefined, commitmentToUtxo = undefined, finalTxRecord, membershipProofOption }: ProveInclusionParams
) {
  if (!nullifierToUtxo || !commitmentToUtxo) {
    const { nullifierToUtxo: nullifierToUtxo_, commitmentToUtxo: commitmentToUtxo_ } = await buildMappings(keypair, events, txRecordEvents)
    nullifierToUtxo = nullifierToUtxo_
    commitmentToUtxo = commitmentToUtxo_
  }
  const steps = await getPoiSteps({ txRecordEvents, associationSet, nullifierToUtxo, commitmentToUtxo, finalTxRecord })
  console.log("Steps->", steps)
  console.log("txRecordsMerkleTree->", txRecordEvents)
  const txRecordsMerkleTree = buildTxRecordMerkleTree({ events: txRecordEvents })
  let allowedTxRecordsMerkleTree;
  if(membershipProofOption == 0) {
    allowedTxRecordsMerkleTree = buildTxRecordMerkleTree({ events: steps.map((step) => step.toEvent())}) // TODO: Change this to use deposits only.
  } else if (membershipProofOption == 1) {
    allowedTxRecordsMerkleTree = buildTxRecordMerkleTree({ events: associationSet })
  } else {
    throw new Error('Invalid membershipProofOption')
  }
  
  console.log("allowedTxRecordsMerkleTree->", allowedTxRecordsMerkleTree)
  let accInnocentCommitments = [ZERO_LEAF, ZERO_LEAF]
  console.log("accInnocentCommitments->", accInnocentCommitments)
  let poiInputs = []
  for (let i = 0; i < steps.length; i++) {
    const { stepInputs, outputInnocentCommitments } = steps[i].generateInputs({
      txRecordsMerkleTree,
      allowedTxRecordsMerkleTree: allowedTxRecordsMerkleTree,
      accInnocentCommitments,
      isLastStep: i == steps.length - 1,
    })
    accInnocentCommitments = outputInnocentCommitments
    poiInputs.push(
      utils.stringifyBigInts(stepInputs)
    )
  }
  console.log("poiInputs->", poiInputs)
  return {poiInputs, associationSetLeaves: allowedTxRecordsMerkleTree.elements, associationSetRoot: allowedTxRecordsMerkleTree.root}
}

export { proveInclusion }
