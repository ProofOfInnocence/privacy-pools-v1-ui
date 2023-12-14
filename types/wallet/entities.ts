export type WalletAccount = {
    address: string
    ensName: string
    balance: number
}

export type Provider = {
    name: string
    network: number
    chainId: number
    isConnected: boolean
    mismatchNetwork: boolean
}
