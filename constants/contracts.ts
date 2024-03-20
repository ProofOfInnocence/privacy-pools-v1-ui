import { ChainId } from '@/types'

export const OFFCHAIN_ORACLE_CONTRACT = '0x07D91f5fb9Bf7798734C3f606dB065549F6893bb'

export const POOL_CONTRACT: { [chainId in ChainId]: string } = {
  // [ChainId.XDAI]: '0xD692Fd2D0b2Fbd2e52CFa5B5b9424bC981C30696',
  // [ChainId.BSC]: '',
  // [ChainId.MAINNET]: '',
  [ChainId.ETHEREUM_SEPOLIA]: '0x8e3E4702B4ec7400ef15fba30B3e4bfdc72aBC3B'
}
// export const REDGISTRY_CONTRACT: { [chainId in ChainId]: string } = {
//   [ChainId.MAINNET]: '0x58E8dCC13BE9780fC42E8723D8EaD4CF46943dF2',
//   [ChainId.BSC]: '',
//   [ChainId.XDAI]: ''
// }

// export const AGGREGATOR_FACTORY: { [chainId in ChainId]: string } = {
//   [ChainId.MAINNET]: '0xE8F47A78A6D52D317D0D2FFFac56739fE14D1b49',
//   [ChainId.BSC]: '',
//   [ChainId.XDAI]: ''
// }

export const WRAPPED_TOKEN: { [chainId in ChainId]: string } = {
  // [ChainId.MAINNET]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH on mainnet
  // [ChainId.XDAI]: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', // WETH on xdai
  // [ChainId.BSC]: '0xCa8d20f3e0144a72C6B5d576e9Bd3Fd8557E2B04', // WBNB on xdai
  [ChainId.ETHEREUM_SEPOLIA]: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', // WETH on ethereum goerli
}

export const ETH_MAIN_TOKEN: { [chainId in ChainId]: string } = {
  [ChainId.ETHEREUM_SEPOLIA]: '0xdD69DB25F6D620A7baD3023c5d32761D353D3De9' // GETH on ethereum goerli
}

export const RPC_LIST: { [chainId in ChainId]: string } = {
  // [ChainId.BSC]: 'https://bsc-mainnet.chainnodes.org/d692ae63-0a7e-43e0-9da9-fe4f4cc6c607',
  // [ChainId.MAINNET]: 'https://mainnet.chainnodes.org/d692ae63-0a7e-43e0-9da9-fe4f4cc6c607',
  // [ChainId.XDAI]: 'https://gnosis-mainnet.chainnodes.org/d692ae63-0a7e-43e0-9da9-fe4f4cc6c607',
  [ChainId.ETHEREUM_SEPOLIA]: 'https://ethereum-sepolia-rpc.publicnode.com'
}

export const FALLBACK_RPC_LIST: { [chainId in ChainId]: string[] } = {
  // [ChainId.BSC]: [
  //   'https://binance.nodereal.io',
  //   // 'https://rpc.ankr.com/bsc/dbe08b852ba176a8aeac783cc1fa8becaf4f107235dfdae79241063fbf52ca4a',
  // ],
  // [ChainId.MAINNET]: [
  //   'https://rpc.mevblocker.io',
  //   // 'https://rpc.ankr.com/eth/dbe08b852ba176a8aeac783cc1fa8becaf4f107235dfdae79241063fbf52ca4a',
  // ],
  // [ChainId.XDAI]: [
  //   // 'https://rpc.ankr.com/gnosis/dbe08b852ba176a8aeac783cc1fa8becaf4f107235dfdae79241063fbf52ca4a',
  //   'https://rpc.gnosis.gateway.fm',
  // ],
  [ChainId.ETHEREUM_SEPOLIA]: [
    'https://rpc.sepolia.org'
  ]
}

export const RPC_WS_LIST: { [chainId in ChainId]: string } = {
  // [ChainId.MAINNET]: 'wss://mainnet.chainnodes.org/d692ae63-0a7e-43e0-9da9-fe4f4cc6c607',
  // [ChainId.BSC]: 'wss://bsc-mainnet.chainnodes.org/d692ae63-0a7e-43e0-9da9-fe4f4cc6c607',
  // [ChainId.XDAI]: 'wss://gnosis-mainnet.chainnodes.org/d692ae63-0a7e-43e0-9da9-fe4f4cc6c607',
  [ChainId.ETHEREUM_SEPOLIA]: 'wss://ethereum-sepolia-rpc.publicnode.com'
}

// export const MULTICALL: { [chainId in ChainId]: string } = {
//   [ChainId.BSC]: '0xf072f255A3324198C7F653237B44E1C4e66f8C42',
//   [ChainId.XDAI]: '0x8677b93D543d0217B32B8FDc20F2316E138D619B',
//   [ChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
// }

// export const BRIDGE_PROXY: { [chainId in ChainId]: string } = {
//   [ChainId.BSC]: '0x05185872898b6f94AA600177EF41B9334B1FA48B',
//   [ChainId.MAINNET]: '0x4c36d2919e407f0cc2ee3c993ccf8ac26d9ce64e',
// }

// export const AMB_BRIDGE: { [chainId in ChainId]: string } = {
//   [ChainId.XDAI]: '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59', // ETH
//   // [ChainId.XDAI]: '0x162E898bD0aacB578C8D5F8d6ca588c13d2A383F', // BNB
//   [ChainId.MAINNET]: '0x162E898bD0aacB578C8D5F8d6ca588c13d2A383F',
// }

// export const BRIDGE_HELPER: { [chainId in ChainId]: string } = {
//   [ChainId.MAINNET]: '0xCa0840578f57fE71599D29375e16783424023357',
//   [ChainId.BSC]: '0x8845F740F8B01bC7D9A4C82a6fD4A60320c07AF1',
// }

// export const BRIDGE_FEE_MANAGER: { [chainId in ChainId]: string } = {
//   [ChainId.XDAI]: '0x5dbC897aEf6B18394D845A922BF107FA98E3AC55',
// }

// export const FOREIGN_OMNIBRIDGE = {
//   [ChainId.MAINNET]: '0x88ad09518695c6c3712AC10a214bE5109a655671',
// }

// export const OMNIBRIDGE = {
//   [ChainId.XDAI]: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
// }

// export const SANCTION_LIST: { [chainId in ChainId]: string } = {
//   [ChainId.MAINNET]: '0x40C57923924B5c5c5455c48D93317139ADDaC8fb',
//   [ChainId.BSC]: '',
//   [ChainId.XDAI]: ''
// }
