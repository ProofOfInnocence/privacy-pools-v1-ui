export type WalletAccount = {
    address: string
    ensName: string
    balance: string
}

export type Provider = {
    name: string
    network: number
    chainId: number
    isConnected: boolean
    mismatchNetwork: boolean
}
