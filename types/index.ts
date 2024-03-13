// const BSC_CHAIN_ID = 56
// const XDAI_CHAIN_ID = 100
// const MAINNET_CHAIN_ID = 1
const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111

export enum ChainId {
  // BSC = BSC_CHAIN_ID,
  // XDAI = XDAI_CHAIN_ID,
  // MAINNET = MAINNET_CHAIN_ID,
  ETHEREUM_SEPOLIA = ETHEREUM_SEPOLIA_CHAIN_ID,
}

export type PoolChainId = typeof ChainId.ETHEREUM_SEPOLIA

// export type L1ChainId = typeof ChainId.MAINNET
// export type L2ChainId = typeof ChainId.XDAI

export interface WalletInfo {
  // eslint-disable-next-line
  connector?: any
  name: string
  iconName: string
  description: string
}

export type NetworkConfigItem = {
  symbol: string
  name: string
  icon: string
  shortName: string
  network: string
  deployBlock: number
  blockDuration: number
  blockGasLimit: number
  hexChainId: string
  isEipSupported: boolean
  ensSubdomainKey: string
  blockExplorerUrl: string
}

export type MetamaskConfigItem = {
  chainId: string
  chainName: string
  rpcUrls: string[]
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockExplorerUrls: string[]
}

export type NetworkConfig = {
  [key in number]: NetworkConfigItem
}

export type MetamaskList = {
  [key in number]: MetamaskConfigItem
}

export type Plugin<P> = (options: string | P) => void
export type Inject<T> = (name: string, plugin: Plugin<T> | T) => void

// export * from './store'
// export * from './entities'

export type RelayerInfo = {
  name: string
  api: string
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  LOADING = 'loading',
}

export type LoggerType = (message: string, logLevel: LogLevel) => void
