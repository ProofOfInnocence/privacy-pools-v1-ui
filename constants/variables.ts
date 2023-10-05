import { BigNumber } from 'ethers'

import { WalletInfo, ChainId } from '@/types'
import { localConnector } from '@/services'

const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  METAMASK: {
    connector: () => window.ethereum,
    name: 'MetaMask',
    iconName: 'metamask',
    description: 'Easy-to-use browser extension.',
  },
  LOCAL: {
    connector: () => localConnector(),
    name: 'Local',
    iconName: 'local',
    description: 'Frontend wallet.',
  },
}

const numbers = {
  ZERO: 0,
  ONE: 1,
  TWO: 2,
  TEN: 10,
  THREE: 3,
  GWEI: 1e9,
  WEI: 1e18,
  OX_LENGTH: 2,
  PRECISION: 4,
  SECOND: 1000,
  SIX_TEEN: 16,
  THOUSAND: 1000,
  FEE_PRECISION: 6,
  ONE_HUNDRED: 100,
  ETH_DECIMALS: 18,
  GWEI_DECIMALS: 9,
  LOADER_DELAY: 500,
  PAGINATION_STEP: 1,
  ETHER_DECIMALS: 18,
  INPUT_LENGTH_2: 2,
  INPUT_LENGTH_16: 16,
  NULLIFIER_LENGTH: 66,
  CHECK_URL_DELAY: 300,
  TOAST_DURATION: 8000,
  REQUEST_TIMEOUT: 5000,
  MERKLE_TREE_HEIGHT: 23,
  CHECK_AMOUNT_DELAY: 500,
  CHECK_ADDRESS_DELAY: 300,
  GET_EVENTS_TIMEOUT: 60000,
  MIN_BRIDGE_CONFIRMATION: 20, // for bsc 15 (eth - 20)
  MIN_TRANSFER_CONFIRMATION: 1,
  CONFIRM_MODAL_CLOSE_TIME: 30000,
  POOL_INFORMATION_UPDATE_TIME: 30000,
  START_BALANCE_WATCHER_DEBOUNCE: 30000,
}

const MAX_REDUCE_LENGTH = 160
const BG_ZERO = BigNumber.from(numbers.ZERO)

const FIELD_SIZE = BigNumber.from('21888242871839275222246405745257275088548364400416034343698204186575808495617')

const operationGasLimits: { [key in string]: number } = {
  // 291019 - estimate gas
  // using estimate gas + 20k gas
  FUND: 310000,
  TRANSFER: 2200000, // bump 10% 2000000
  WITHDRAW: 2200000,
} as const

const L1_WITHDRAW_GAS_LIMIT = 350000
const APP_ENS_NAME = 'nova.tornadocash.eth'
const SESSION_STORAGE_KEY = 'tornado_key'

const SIGN_MESSAGE = `Sign this message to generate your TornadoCash Nova Privacy Key. This key lets the application decrypt your balance in TornadoCash Nova.\n\nIMPORTANT: Only sign this message if you trust the application.`

const REGISTRY_DEPLOYED_BLOCK: Record<ChainId, number> = {
  [ChainId.MAINNET]: 14173129,
}

const registerGuideUrl = 'https://hackmd.io/@yfVgphY1TiKixVMVfVLAlw/B1Bp3p4UF'

const BRIBE = '1500000000000000' // toWei(0.0015)

const MIN_GAS_PRICE = '20000000000' // toWei(20, 'gwei')

export {
  BRIBE,
  BG_ZERO,
  numbers,
  FIELD_SIZE,
  SIGN_MESSAGE,
  APP_ENS_NAME,
  MIN_GAS_PRICE,
  registerGuideUrl,
  MAX_REDUCE_LENGTH,
  SUPPORTED_WALLETS,
  operationGasLimits,
  SESSION_STORAGE_KEY,
  REGISTRY_DEPLOYED_BLOCK,
  L1_WITHDRAW_GAS_LIMIT,
}
