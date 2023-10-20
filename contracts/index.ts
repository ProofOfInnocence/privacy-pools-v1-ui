import { ChainId } from '@/types'
import { getProvider } from '@/services'
import {
  WRAPPED_TOKEN,
  POOL_CONTRACT,
  OFFCHAIN_ORACLE_CONTRACT,
} from '@/constants'

import {
  PrivacyPool__factory as TornadoPoolFactory,
  WETH__factory as WETHFactory
} from '@/_contracts'

export function getTornadoPool(chainId: ChainId) {
  const { provider } = getProvider(chainId)
  const tornadoPool =  TornadoPoolFactory.connect(POOL_CONTRACT[chainId], provider)
  return tornadoPool
}

// export function getBridgeHelper(chainId: L1ChainId) {
//   const { provider } = getProvider(chainId)
//   return BscBridgeHelper.connect(BRIDGE_HELPER[chainId], provider)
// }

export function getWrappedToken(chainId: ChainId) {
  const { provider } = getProvider(chainId)
  return WETHFactory.connect(WRAPPED_TOKEN[chainId], provider)
}

// export function getBridgeProxy(chainId: L1ChainId) {
//   const { provider } = getProvider(chainId)
//   return BridgeBNB.connect(BRIDGE_PROXY[chainId], provider)
// }

// export function getAmbBridge(chainId: L1ChainId) {
//   const { provider } = getProvider(chainId)
//   return AmbBridge.connect(AMB_BRIDGE[chainId], provider)
// }

// export function getMulticall(chainId: ChainId) {
//   const { provider } = getProvider(chainId)
//   return MulticallFactory.connect(MULTICALL[chainId], provider)
// }

// export function getOffChainOracle() {
//   const { provider } = getProvider(ChainId.MAINNET)
//   return OffchainOracleFactory.connect(OFFCHAIN_ORACLE_CONTRACT, provider)
// }

// export function getBridgeFeeManager(chainId: L2ChainId) {
//   const { provider } = getProvider(chainId)
//   return FeeManager.connect(BRIDGE_FEE_MANAGER[chainId], provider)
// }

// export function getRelayerRegistry(chainId: ChainId) {
//   const { provider } = getProvider(chainId)
//   return RelayerRegistryFactory.connect(REDGISTRY_CONTRACT[chainId], provider)
// }

// export function getAggregator(chainId: ChainId) {
//   const { provider } = getProvider(chainId)
//   return AggregatorFactory.connect(AGGREGATOR_FACTORY[chainId], provider)
// }

// export function getForeignOmnibridge(chainId: ChainId) {
//   const { provider } = getProvider(chainId)
//   return ForeignOmnibridgeFactory.connect(FOREIGN_OMNIBRIDGE[chainId], provider)
// }

// export function getOmnibridge(chainId: ChainId) {
//   const { provider } = getProvider(chainId)
//   return OmnibridgeFactory.connect(OMNIBRIDGE[chainId], provider)
// }

// export function getSanctionList(chainId: ChainId) {
//   const { provider } = getProvider(chainId)
//   return SanctionsListFactory.connect(SANCTION_LIST[chainId], provider)
// }
