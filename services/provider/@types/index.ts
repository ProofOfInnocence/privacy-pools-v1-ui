import { Listener } from '@ethersproject/abstract-provider'

export type Address = string

export interface Params {
  to: string
  gas: string
  from: string
  data: string
  type?: string
  value: string
  nonce?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
}

export interface SendRequestParams {
  method: string
  params?: Params[] | object | string
}

export type OldRequestParams = {
  from: string
} & SendRequestParams

export interface ContractRequestParams {
  to: string
  gas: string
  from: string
  methodName: string
  data?: string
  value?: number
}

export type TransactionStatus = 'success' | 'fail' | 'pending'

export interface TransactionResult {
  timestamp: number
  transactionHash: string
  transactionIndex: string
  blockNumber: number
  blockHash: string
  cumulativeGasUsed: string
  gasUsed: string
  contractAddress: string
  logs: string[]
  logsBloom: string
  status: string
}

export interface TransactionByHash {
  from: string
  gas: string
  gasPrice: string
  hash: string
  input: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  nonce: number
  r: string
  s: string
  to: string
  transactionIndex: number | null
  type: string
  v: string
  value: string
  data: string
}

export type Transaction = {
  value: string
} & TransactionResult

export interface TransactionReceipt {
  status: TransactionStatus
  transactionError?: string
  transactionResult: TransactionResult
}

export interface GetBalanceParams {
  address: string
}

export interface WaitForTxReceiptParams {
  txHash: string
  minConfirmation?: number
  attempt?: number
  callback?: CallableFunction
}

export interface BatchRequestParams {
  txs: Params[]
  callback?: (params: Array<Promise<unknown>>) => void
}

export interface OnListenerParams {
  method: string
  callback: Listener
}

export type ProviderOptions = {
  callRetryAttempt?: number
} & InitProviderParams

type ProviderVersions = 'new' | 'old'

type SendAsyncParams = {
  id: number
  jsonrpc: string
} & OldRequestParams

export type RpcProvider = {
  on: (method: string, callback?: CallableFunction) => void
  request: <T>(params: SendRequestParams) => Promise<T>
  sendAsync: (params: SendAsyncParams, callback: CallableFunction) => void
  enable: () => Promise<string[]>
} & ExternalProvider

// need for ethers
export interface ExternalProvider {
  isMetaMask?: boolean
  isStatus?: boolean
  host?: string
  path?: string
  sendAsync?: <T>(request: { method: string; params?: never[] }, callback: (error: Error, response: T) => void) => void
  send?: <T>(request: { method: string; params?: never[] }, callback: (error: Error, response: T) => void) => void
  request?: <T>(request: { method: string; params?: never[] }) => Promise<T>
}

export interface InitProviderParams {
  version?: ProviderVersions
  provider: RpcProvider
}

export interface ProviderInstance {
  provider?: RpcProvider

  setupProvider: () => Promise<Address>
  sendRequest: (params: SendRequestParams) => Promise<TransactionResult>
  getBalance: (params: GetBalanceParams) => Promise<string>
  waitForTxReceipt: (params: WaitForTxReceiptParams) => Promise<Transaction>
  batchRequest: <T>(params: BatchRequestParams) => Promise<T[]>
  checkNetworkVersion: () => Promise<number>

  on: (params: OnListenerParams) => void
}
