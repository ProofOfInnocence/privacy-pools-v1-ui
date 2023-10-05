import { ChainId, L1ChainId, L2ChainId } from '@/types'
import { getProvider } from '@/services'
import {
  WRAPPED_TOKEN,
  MULTICALL,
  POOL_CONTRACT,
  OFFCHAIN_ORACLE_CONTRACT,
  REDGISTRY_CONTRACT,
  AGGREGATOR_FACTORY,
} from '@/constants'

import {
  WbnbXdai__factory as WBNBXdai,
  BridgeBNB__factory as BridgeBNB,
  AmbBridge__factory as AmbBridge,
  FeeManager__factory as FeeManager,
  Multicall__factory as MulticallFactory,
  Aggregator__factory as AggregatorFactory,
  Omnibridge__factory as OmnibridgeFactory,
  TornadoPool__factory as TornadoPoolFactory,
  BscBridgeHelper__factory as BscBridgeHelper,
  SanctionsList__factory as SanctionsListFactory,
  OffchainOracle__factory as OffchainOracleFactory,
  RelayerRegistry__factory as RelayerRegistryFactory,
  ForeignOmnibridge__factory as ForeignOmnibridgeFactory,
} from '@/_contracts'

export function getTornadoPool(chainId: L2ChainId) {
  const { provider } = getProvider(chainId)
  return TornadoPoolFactory.connect(POOL_CONTRACT[chainId], provider)
}

// export function getBridgeHelper(chainId: L1ChainId) {
//   const { provider } = getProvider(chainId)
//   return BscBridgeHelper.connect(BRIDGE_HELPER[chainId], provider)
// }

// export function getWrappedToken(chainId: L2ChainId) {
//   const { provider } = getProvider(chainId)
//   return WBNBXdai.connect(WRAPPED_TOKEN[chainId], provider)
// }

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
