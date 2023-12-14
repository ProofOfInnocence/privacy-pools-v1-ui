import { ChainId } from '@/types'

import { Transaction, TxInfo } from './entities'

export type TransactionWatcherParams = {
    txHash: string
    transactionInfo: TxInfo
    chainId: ChainId
}

export interface PoseidonHash2Wrapper {
    left: Element,
    right: Element
}

export type SetTransactionParms = {
    transaction: Transaction
}
