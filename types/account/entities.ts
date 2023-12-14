import { Utxo } from '@/services'
import { CustomUtxo } from '@/services/core/@types'
import { DecryptedEvents } from '@/services/worker/@types'

export type TransferMethod = 'relayer' | 'wallet'
export type RegisteredInPoolStatus = 'registered' | 'notRegistered' | 'notChecked' | 'processing'

export type Settings = {
    shouldShowRiskAlert: boolean
    shouldShowEthLinkAlert: boolean
    shouldShowConfirmModal: boolean
    shouldShowPrivacyAlert: boolean
    shouldShowPoolTransferAlert: boolean
    transferMethod: TransferMethod
}

export type DecryptedCommitmentEvent = {
    utxo: Utxo
    nullifierHash: string
}

export type CheckIncomingUtxoInput = {
    utxo: CustomUtxo
    commitments: DecryptedEvents
}
export type CheckUnspentUtxoInput = {
    unspentUtxo: CustomUtxo[]
    decryptedEvents: DecryptedEvents
}
export type DecryptedCommitmentEvents = DecryptedCommitmentEvent[]
