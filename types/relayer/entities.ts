export type Job = {
    id: string
    jobUrl: string
    type: string
    amount: string
    error?: string
    txHash?: string
    status?: string
}

export type Jobs = {
    activeJob: Job | null
}

export type Loaders = {
    relayersFetching: boolean
}
export type Relayer = {
    name: string
    ensName: string
    url: string
    chainId: number
    version: string
    rewardAddress: string
    type: string
    health: {
        status: boolean
        error: string
    }
    serviceFee: {
        transfer: string
        withdrawal: number
    }
}

export type Relayers = {
    list: Relayer[]
    selected: Relayer
}

export type JobInfo = {
    status: string
    txHash?: string
    confirmations: number
}
