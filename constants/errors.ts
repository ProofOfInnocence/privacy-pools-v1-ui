import { numbers } from '@/constants'

const validation = {
  MISMATCH_NETWORK: 'Mismatch network',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  INSUFFICIENT_INPUTS: 'Insufficient inputs',
  INVALID_PRIVATE_KEY: 'Invalid private key',
  ACCOUNT_NOT_FOUND: 'Account not registered',
  MAX_DEPOSIT_AMOUNT: 'Maximum deposit amount is',
  INVALID_ADDRESS: 'Recipient address is invalid',
  INVALID_RELAYER: 'This relayer is not available',
  MIN_WITHDRAW_AMOUNT: 'Minimal withdrawal amount is',
  INVALID_SIGNATURE: 'Invalid signature. Please try again',
  SMALL_AMOUNT: 'Insufficient funds, fee great than amount',
  NOT_REGISTERED_IN_POOL: 'Recipient is not registered',
  ALREADY_REGISTERED_IN_POOL: 'Recipient is already registered',
  RELAYER_METHODS_NOT_AVAILABLE: 'Can not to do this operation using relayer',
}

const wallet = {
  FAILED_TX: 'Transaction failed',
  USER_DENIED: 'You declined an action in your wallet',
  USER_REJECTED: 'You declined an action in your wallet',
  LOCKED_PROVIDER: 'Please, unlock your wallet and try again',
  TRY_ADDING_THE_CHAIN: 'Please add a new chain to the wallet',
  ALREADY_PENDING: 'You already have the pending request in the wallet',
  ALREADY_PROCESSING: 'You already have the pending request in the wallet',
}

const processing = {
  DECLINE_OPERATION: 'You declined an operation',
}

const errorsGetter = (args: string[]) => ({
  MAX_WITHDRAW_AMOUNT: `Amount exceeds an available limit of xDAI bridge. Right now the bridge allows withdrawing only ${
    args[numbers.ZERO]
  } ETH more.`,
})

const errors = {
  wallet,
  validation,
  processing,
  errorsGetter,
}

export { errors }
