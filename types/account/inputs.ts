export type SetAccountParams = {
    accountAddress: string
}

export type GetUtxoFromKeypairParams = {
    keypair: string,
    withCache: boolean
}

export type GetIsRegisterInPool = {
    address: string
}

export type CheckRegisterInPoolParams = {
    address: string
}

export type RegisterInPoolParams = {
    address: string
}

export type CreateDepositWithRegisterFromL1Params = {
    amount: string
}

export type CreateDepositFromL1Params = {
    amount: string
    address: string
}

export type CreateWithdrawalParams = {
    amount: string
    address: string
    isL1Withdrawal?: boolean
}
