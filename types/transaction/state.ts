import { PendingTxs, Transaction } from './entities'

export type TransactionState = {
    txHash: string[]
    pendingTxs: PendingTxs
    accountsEntities: Record<string, { [key in string]: Transaction }>
    entities: { [key in string]: Transaction }
}
