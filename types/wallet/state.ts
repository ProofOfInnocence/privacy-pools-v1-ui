import { Provider, WalletAccount } from './entities'

export type WalletState = {
    provider: Provider
    account: WalletAccount
}
