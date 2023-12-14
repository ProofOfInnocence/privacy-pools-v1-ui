import { ChainId } from '@/types'
import { CreateTransactionParams } from '@/services/core/@types'

import { jobStatuses } from '@/constants'

export type WithdrawalRelayerParams = {
    amount: string
    address: string
}

export type TransferRelayerParams = WithdrawalRelayerParams

export type CreateRelayerTransactionParams = {
    amount: string
    type: string
} & CreateTransactionParams

export type WatchJobParams = {
    type: string
    jobUrl: string
    amount: string
    id: string
    chainId: ChainId
}

export type GetRelayerParams = {
    ensName: string
    url: string
    name: string
}

export type getRelayerUrlFromENSParams = {
    ensName: string
}

export type WatcherCallbackParams = {
    id: string
    status?: jobStatuses
    txHash?: string
    error?: string
}
