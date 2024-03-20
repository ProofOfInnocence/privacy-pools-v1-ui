import { BigNumber, BigNumberish } from 'ethers'

import { BytesLike } from '@ethersproject/bytes'
import { CommitmentEvents, TxRecordEvents } from '@/services/events/@types'
import MerkleTree from 'fixed-merkle-tree'
import { TxRecord } from '../txRecord'

export interface UtxoOptions {
  amount?: BigNumber | number | string
  blinding?: BigNumber
  index?: number
  keypair?: BaseKeypair
}

export interface BaseUtxo {
  keypair: BaseKeypair
  amount: BigNumber
  blinding: BigNumber
  index: number
  commitment?: BigNumber
  nullifier?: BigNumber

  getNullifier: () => BigNumber
  getCommitment: () => BigNumber
  encrypt: () => string
  getSignature: () => BigNumber
}

export type CustomUtxo = BaseUtxo & { transactionHash: string }

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class UtxoStatic {
  // @ts-expect-error
  static decrypt(keypair: BaseKeypair, data: string, index: number): BaseUtxo
}

export interface BaseKeypair {
  privkey: string
  pubkey: BigNumber
  encryptionKey: string

  toString: () => string
  address: () => string
  encrypt: (bytes: Buffer) => string
  decrypt: (data: string) => Buffer
  sign: (commitment: BigNumber, merklePath: BigNumberish) => BigNumber
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class KeypairStatic {
  // @ts-expect-error
  static fromString(str: string): BaseKeypair
}

export type PrepareTxParams = {
  outputs?: BaseUtxo[]
  inputs?: BaseUtxo[]
  fee?: BigNumber
  relayer?: string | BigNumber
  rootHex?: string
  recipient?: string | BigNumber
  events?: CommitmentEvents
  isL1Withdrawal?: boolean
  l1Fee?: BigNumber
  membershipProofURI?: string
}

export type ProveInclusionParams = {
  txRecordEvents: TxRecordEvents
  associationSet: TxRecordEvents
  nullifierToUtxo?: Map<string, BaseUtxo>
  commitmentToUtxo?: Map<string, BaseUtxo>
  finalTxRecord: TxRecord
  membershipProofOption?: number
}

export type GeneratePoiStepParams = {
  txRecordsMerkleTree: MerkleTree
  allowedTxRecordsMerkleTree: MerkleTree
  accInnocentCommitments: BigNumber[]
  isLastStep: boolean
}

export type ProofParams = {
  inputs: BaseUtxo[]
  outputs: BaseUtxo[]
  // eslint-disable-next-line
  tree: any
  isL1Withdrawal: boolean
  l1Fee: BigNumber
  extAmount: BigNumber
  fee: BigNumber
  recipient: string | BigNumber
  relayer: string | BigNumber
  membershipProofURI: string
}

export type ExtData = {
  recipient: string
  extAmount: string | bigint
  relayer: string
  fee: string
  encryptedOutput1: BytesLike
  encryptedOutput2: BytesLike
  membershipProofURI: string
}

export type ArgsProof = {
  proof: BytesLike
  root: BytesLike
  inputNullifiers: [string, string]
  outputCommitments: [BytesLike, BytesLike]
  publicAmount: BigNumberish
  extDataHash: string
}

export type MembershipProof = string

export type InputByType = {
  base64: string
  string: string
  text: string
  binarystring: string
  array: number[]
  uint8array: Uint8Array
  arraybuffer: ArrayBuffer
  blob: Blob
  stream: NodeJS.ReadableStream
}

export type InputFileFormat = InputByType[keyof InputByType]

export type DownloadParams = {
  prefix: string
  name: string
  contentType: string
}

export type FetchFileParams = {
  id?: string
  url: string
  name: string
  retryAttempt?: number
}

export type CreateTransactionParams = {
  outputs?: BaseUtxo[]
  inputs?: BaseUtxo[]
  fee?: BigNumber
  relayer?: string | BigNumber
  recipient?: string | BigNumber
  rootHex?: string
  events?: CommitmentEvents
  isL1Withdrawal?: boolean
  l1Fee?: BigNumber
  membershipProofURI?: string
  secondOutputBlinding?: string
}

export type EstimateTransactParams = {
  args: ArgsProof
  extData: ExtData
}
