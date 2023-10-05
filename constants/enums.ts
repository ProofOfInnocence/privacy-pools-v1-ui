enum registerStatuses {
  NOT_CHECKED = 'notChecked',
  REGISTERED = 'registered',
  NOT_REGISTERED = 'notRegistered',
  PROCESSING = 'processing',
}

enum transferMethods {
  WALLET = 'wallet',
  RELAYER = 'relayer',
}

enum transactionMethods {
  FUND = 'fund',
  TRANSFER = 'transfer',
  WITHDRAW = 'withdraw',
  SETUP = 'setup',
  APPROVAL = 'approval',
  BRIDGE = 'bridge',
}

enum confirmationStatus {
  SUCCESS = 'success',
  FAIL = 'fail',
  LOADING = 'loading',
  START = '',
}
enum confirmationStep {
  PREPARE = 'prepare',
  GENERATE = 'generate',
  TRANSACT = 'transact',
  WAIT = 'wait',
  BRIDGE = 'bridge',
  COMPLETE = 'complete',
}

enum transactionTitles {
  FUND = 'fund',
  INCOMING_FUND = 'incoming fund',
  SETUP = 'setup account',
  TRANSFER = 'transfer',
  APPROVAL = 'approval',
  WITHDRAW = 'withdrawal',
  BRIDGE = 'settled',
}

enum jobStatuses {
  SENT = 'SENT',
  MINED = 'MINED',
  QUEUED = 'QUEUED',
  FAILED = 'FAILED',
  ACCEPTED = 'ACCEPTED',
  CONFIRMED = 'CONFIRMED',
}

enum relayersTypes {
  CUSTOM = 'custom',
  REGULAR = 'regular',
}

export {
  jobStatuses,
  relayersTypes,
  transferMethods,
  confirmationStep,
  confirmationStatus,
  transactionTitles,
  registerStatuses,
  transactionMethods,
}
