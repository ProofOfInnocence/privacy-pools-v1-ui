import { BigNumber } from 'ethers'
import { TxRecordEvent } from '../events/@types'
import { BaseUtxo, GeneratePoiStepParams } from './@types'
import { poseidonHash, poseidonHash2, toFixedHex } from './utils'

class TxRecord {
  public inputs: BaseUtxo[]
  public outputs: BaseUtxo[]
  public publicAmount: string
  public index: number

  public constructor({ inputs = [], outputs = [], publicAmount = '', index = 0 } = {}) {
    this.inputs = inputs
    this.outputs = outputs
    this.publicAmount = publicAmount
    this.index = index
  }

  public hash() {
    return poseidonHash([
      poseidonHash([
        poseidonHash([
          this.inputs[0].getNullifier(),
          this.inputs[1].getNullifier(),
          this.outputs[0].getCommitment(),
          this.outputs[1].getCommitment(),
        ]),
        this.publicAmount,
      ]),
      this.index,
    ])
  }

  static hashFromEvent(event: TxRecordEvent) {
    return poseidonHash([
      poseidonHash([
        poseidonHash([event.inputNullifier1, event.inputNullifier2, event.outputCommitment1, event.outputCommitment2]),
        event.publicAmount,
      ]),
      event.index,
    ])
  }

  public generateInputs({ txRecordsMerkleTree, allowedTxRecordsMerkleTree, accInnocentCommitments, isLastStep }: GeneratePoiStepParams) {
    const txRecord = toFixedHex(this.hash())
    let txRecordsPathIndex
    let txRecordsPathElements

    if (!isLastStep) {
      txRecordsPathIndex = txRecordsMerkleTree.indexOf(txRecord)
      txRecordsPathElements = txRecordsMerkleTree.path(txRecordsPathIndex).pathElements
    } else {
      txRecordsPathIndex = 0
      txRecordsPathElements = new Array(txRecordsMerkleTree.levels).fill(0)
    }

    const step_in = poseidonHash([
      txRecordsMerkleTree.root,
      allowedTxRecordsMerkleTree.root,
      poseidonHash2(accInnocentCommitments[0], accInnocentCommitments[1]),
    ])

    let allowedTxRecordsPathIndex = null
    let allowedTxRecordsPathElements = null
    if (BigNumber.from(this.publicAmount).lt(BigNumber.from(2).pow(240))) {
      allowedTxRecordsPathIndex = allowedTxRecordsMerkleTree.indexOf(txRecord)
      if (allowedTxRecordsPathIndex < 0) {
        throw new Error(`txRecord ${txRecord} not found in allowedTxRecordsMerkleTree`)
      }
      allowedTxRecordsPathElements = allowedTxRecordsMerkleTree.path(allowedTxRecordsPathIndex).pathElements
    } else {
      allowedTxRecordsPathIndex = 0
      allowedTxRecordsPathElements = new Array(allowedTxRecordsMerkleTree.levels).fill(0)
    }
    let inPrivateKey = []
    let inputNullifier = []
    let inAmount = []
    let inBlinding = []
    let inPathIndices = []
    let outputCommitment = []
    let outAmount = []
    let outPubkey = []
    let outBlinding = []

    for (let i = 0; i < this.inputs.length; i++) {
      inPrivateKey.push(this.inputs[i].keypair.privkey)
      inputNullifier.push(this.inputs[i].getNullifier())
      inAmount.push(this.inputs[i].amount)
      inBlinding.push(this.inputs[i].blinding)
      inPathIndices.push(this.inputs[i].index)
    }
    let outputInnocentCommitments = []
    for (let j = 0; j < this.outputs.length; j++) {
      outputCommitment.push(this.outputs[j].getCommitment())
      outAmount.push(this.outputs[j].amount)
      outPubkey.push(this.outputs[j].keypair.pubkey)
      outBlinding.push(this.outputs[j].blinding)
      // console.log(this)
      outputInnocentCommitments.push(poseidonHash([this.outputs[j].getCommitment(), isLastStep ? 0 : this.outputs[j].index]))
    }
    return {
      stepInputs: {
        txRecordsPathElements: txRecordsPathElements,
        txRecordsPathIndex: txRecordsPathIndex,
        allowedTxRecordsPathElements: allowedTxRecordsPathElements,
        allowedTxRecordsPathIndex: allowedTxRecordsPathIndex,
        accInnocentCommitments,
        isLastStep: isLastStep,
        txRecordsMerkleRoot: txRecordsMerkleTree.root,
        allowedTxRecordsMerkleRoot: allowedTxRecordsMerkleTree.root,
        step_in: step_in,
        publicAmount: this.publicAmount,
        outputsStartIndex: this.index,
        inputNullifier: inputNullifier,
        inAmount: inAmount,
        inPrivateKey: inPrivateKey,
        inBlinding: inBlinding,
        inPathIndices: inPathIndices,
        outputCommitment: outputCommitment,
        outAmount: outAmount,
        outPubkey: outPubkey,
        outBlinding: outBlinding,
      },
      outputInnocentCommitments,
    }
  }
}

export { TxRecord }
