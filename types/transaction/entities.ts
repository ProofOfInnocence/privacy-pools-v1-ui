import { ChainId } from '@/types/index'

export type Transaction = {
    type?: string
    status: string
    chainId?: ChainId
    amount: string
    timestamp: number
    blockNumber: number
    confirmations: number
    transactionHash: string
}

export type PendingTransaction = Omit<Transaction, 'timestamp' | 'blockNumber' | 'amount' | 'confirmations'>

export type TxInfo = {
    type: string
    value: string
    method: string
    account: string
}

export type PendingTx = TxInfo & {
    transactionHash: string
    chainId: ChainId
}

export type PendingTxs = PendingTx[]

export type Transactions = {
    txHash: string[]
    pendingTxs: PendingTxs
    entities: { [key in string]: Transaction }
}
