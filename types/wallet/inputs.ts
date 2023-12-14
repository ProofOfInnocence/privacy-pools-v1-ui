import { ChainId } from '@/types'

export type SetProviderParams = {
    name: string
    network: number
}

export type SetWalletParams = {
    address: string
}

export type CreateWalletTransactionParams = {
    amount?: string
    calldata: string
    to: string
    type: string
}

export type DecryptParams = {
    hexData: string
}

export type ChangeChainParams = {
    chainId: ChainId
}
