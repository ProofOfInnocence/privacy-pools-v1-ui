import { BigNumber } from 'ethers'

import { Keypair } from '@/services'
import { DecryptedEvents } from '@/services/worker/@types'
import { CommitmentEvents } from '@/services/events/@types'
import { CustomUtxo } from '@/services/core/@types'

export type GetUnspentUtxoPayload = {
  keypair: Keypair
  decryptedEvents: DecryptedEvents
  freshDecryptedEvents: DecryptedEvents
}

export type GetCashedEventsPayload = {
  storeName: string
  privateKey: string
  publicKey: BigNumber
}

export type BatchEventsPayload = {
  blockTo: number
  blockFrom: number
  privateKey: string
  publicKey: BigNumber
  withCache?: boolean
  cachedEvents: DecryptedEvents
}

export type UnspentUtxoData = {
  totalAmount: BigNumber
  unspentUtxo: CustomUtxo[]
  accountAddress?: string
}

export type DecryptedHashes = Array<{
  id: string
  hash: string
}>

export type UnspentUtxoDataBatch = UnspentUtxoData & {
  decrypted: DecryptedEvents
  commitments: CommitmentEvents
  decryptedHashes: DecryptedHashes
}

export type GetBatchUtxoPayload = {
  batch: [number, number]
  index: number
  keypair: Keypair
  decryptedEvents: DecryptedEvents
  callback: (payload: UnspentUtxoData) => void
}

export type FetchBatchUtxoPayload = {
  batch: [number, number]
  index: number
  keypair: Keypair
  decryptedEvents: DecryptedEvents
}

export type RestoreUtxoPayload = {
  keypair: Keypair
  callback: (payload: UnspentUtxoData) => void
}

export type GetFreshUtxoPayload = {
  keypair: Keypair
  cachedData: CachedData
  callback: (payload: UnspentUtxoData) => void
}

export type GetUtxoPayload = {
  keypair: Keypair
  withCache?: boolean
  callbacks: {
    set: (payload: UnspentUtxoData) => void
    update: (payload: UnspentUtxoData) => void
  }
}

export type CachedData = UnspentUtxoData & {
  latestBlock: number
  decryptedEvents: DecryptedEvents
}

export type FetchUnspentUtxoRes = UnspentUtxoData & {
  freshUnspentUtxo: CustomUtxo[]
  freshDecryptedEvents: DecryptedEvents
}

export type CachedEvents = {
  latestBlock: number
  decrypted: DecryptedEvents
  commitments: CommitmentEvents
}

export type BatchEventPayload = {
  blockFrom: number
  blockTo: number
  cachedEvents: DecryptedEvents
  keypair: Keypair
  index: number
}
