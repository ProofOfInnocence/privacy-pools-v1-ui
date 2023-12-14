import { RegisteredInPoolStatus, Settings } from './entities'

type Wei = string
type Address = string

export type AccountState = {
    ensName: string
    address: Address
    balance: Wei
    isBalanceFetching: boolean
    registeredInPoolStatus: RegisteredInPoolStatus
    settings: Settings
}
