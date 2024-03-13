import { ChainId, NetworkConfig, MetamaskList } from '@/types'
import { RPC_LIST } from '@/constants'

// const L1_CHAIN_ID = ChainId.MAINNET

const CHAINS: NetworkConfig = {
  [ChainId.ETHEREUM_SEPOLIA]: {
    symbol: 'ETH',
    name: 'ethereum',
    shortName: 'eth',
    icon: 'ethereum',
    network: 'Sepolia',
    deployBlock: 5471254,
    blockDuration: 15000,
    blockGasLimit: 144000000,
    hexChainId: '0xAA36A7',
    isEipSupported: true,
    ensSubdomainKey: 'sepolia-tornado',
    blockExplorerUrl: 'https://sepolia.etherscan.io'
  },
  // [ChainId.XDAI]: {
  //   symbol: 'XDAI',
  //   name: 'xdai',
  //   shortName: 'xdai',
  //   icon: 'ethereum',
  //   network: 'XDAI',
  //   blockDuration: 3000, // ms
  //   deployBlock: 19097755, // ETH
  //   // deployBlock: 20446605, // BNB
  //   blockGasLimit: 144000000, // rpc block gas limit
  //   hexChainId: '0x64',
  //   isEipSupported: false,
  //   ensSubdomainKey: 'gnosis-nova',
  //   blockExplorerUrl: 'https://gnosisscan.io'
  // },
  // [ChainId.MAINNET]: {
  //   symbol: 'ETH',
  //   name: 'ethereum',
  //   shortName: 'eth',
  //   icon: 'ethereum',
  //   network: 'Mainnet',
  //   deployBlock: 13494216,
  //   blockDuration: 15000,
  //   blockGasLimit: 144000000,
  //   hexChainId: '0x1',
  //   isEipSupported: true,
  //   ensSubdomainKey: 'mainnet-tornado',
  //   blockExplorerUrl: 'https://etherscan.io'
  // },
  // [ChainId.BSC]: {
  //   symbol: 'BNB',
  //   name: 'bsc',
  //   shortName: 'bsc',
  //   icon: 'binance',
  //   network: 'BSC',
  //   deployBlock: 14931075,
  //   blockDuration: 3000,
  //   blockGasLimit: 144000000,
  //   hexChainId: '0x38',
  //   isEipSupported: false,
  //   ensSubdomainKey: 'bsc-tornado',
  //   blockExplorerUrl: 'https://bscscan.com'
  // },
}

const METAMASK_LIST: MetamaskList = {
  [ChainId.ETHEREUM_SEPOLIA]: {
    chainId: '0xAA36A7',
    chainName: 'Sepolia Test Network',
    rpcUrls: [RPC_LIST[ChainId.ETHEREUM_SEPOLIA]],
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18,
    },
    blockExplorerUrls: [CHAINS[ChainId.ETHEREUM_SEPOLIA].blockExplorerUrl],
  },
  // [ChainId.BSC]: {
  //   chainId: '0x38',
  //   chainName: 'Binance Smart Chain Mainnet',
  //   rpcUrls: [RPC_LIST[56]],
  //   nativeCurrency: {
  //     name: 'Binance Chain Native Token',
  //     symbol: 'BNB',
  //     decimals: 18,
  //   },
  //   blockExplorerUrls: [CHAINS[ChainId.BSC].blockExplorerUrl],
  // },
  // [ChainId.XDAI]: {
  //   chainId: '0x64',
  //   chainName: 'Gnosis',
  //   rpcUrls: [RPC_LIST[100]],
  //   nativeCurrency: {
  //     name: 'xDAI',
  //     symbol: 'xDAI',
  //     decimals: 18,
  //   },
  //   blockExplorerUrls: [CHAINS[ChainId.XDAI].blockExplorerUrl],
  // },
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const txStatuses = {
  FAIL: '0x00',
  SUCCESS: '0x01',
  PENDING: '0x02',
}

export { CHAINS, ZERO_ADDRESS, txStatuses, METAMASK_LIST }
