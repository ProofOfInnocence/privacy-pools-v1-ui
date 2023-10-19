import { BG_ZERO } from '@/constants'
import { PrepareTxParams } from './@types'
import { TxRecordEvents } from '../events/@types'

async function proveInclusion(
  {
    events = [],
    inputs = [],
    rootHex = '',
    outputs = [],
    fee = BG_ZERO,
    l1Fee = BG_ZERO,
    relayer = BG_ZERO,
    recipient = BG_ZERO,
    isL1Withdrawal = true,
  }: PrepareTxParams,
  txRecordEvents: TxRecordEvents
) {}

export { proveInclusion }
