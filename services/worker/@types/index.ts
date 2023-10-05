import { BigNumber } from 'ethers'

import { CustomUtxo } from '@/services/core/@types'
import { CommitmentEvents, NullifierEvents } from '@/services/events/@types'
import { Keypair } from '@/services/core'

export type EventsPayload = {
  lastSyncBlock?: number
  withCache?: boolean
}

export type GetDecryptEvents = {
  decryptedEvents: DecryptedEvents
  freshDecryptedEvents: DecryptedEvents
}

export type CheckUnspentResult = {
  totalAmount: BigNumber
  unspentUtxo: CommitmentEvents
}

type DecryptedEvent = {
  nullifierHash: string
  blockNumber: number
  index: string
  blinding: string
  amount: string
  commitment: string
  nullifier: string
  transactionHash: string
}

export type DecryptedEvents = DecryptedEvent[]

export type GetUnspentEvents = {
  cachedNullifiers: NullifierEvents
  decryptedEvents: DecryptedEvents
}

export type GetDecryptedEvents = {
  lastSyncBlock: number
  decrypted: DecryptedEvents
  commitments: CommitmentEvents
  userCommitments: CommitmentEvents
  decryptedHashes: DecryptedHashes
}

export type GetUnspentUtxoPayload = {
  decryptedEvents: DecryptedEvents
  keypair: Keypair
  index: number
}

export type UnspentData = {
  totalAmount: BigNumber
  unspentUtxo: CustomUtxo[]
}

export type GetEventsFromTxHashParams = {
  txHash: string
  privateKey: string
  publicKey: BigNumber
}

export type DecryptedHashes = Array<{
  id: string
  hash: string
}>

export type GetFreshUnspentUtxoRes = {
  freshBatchesData: GetDecryptBatchData[]
  lastBlock: number
}

export type GetDecryptBatchData = UnspentData & {
  decrypted: DecryptedEvents
  commitments: CommitmentEvents
  decryptedHashes: DecryptedHashes
}
