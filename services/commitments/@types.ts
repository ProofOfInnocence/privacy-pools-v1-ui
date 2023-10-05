import { BigNumber } from 'ethers'

import { Keypair } from '@/services'
import { CommitmentEvents } from '@/services/events/@types'

export type CachedData = {
  latestBlock: number
  commitments: CommitmentEvents
}

export type GetFreshCommitments = CachedData & {
  keypair: Keypair
}

export type FreshData = {
  freshCommitments: CommitmentEvents
  lastBlock: number
}

export type BatchPayload = {
  batch: [number, number]
  cachedEvents: CommitmentEvents
  keypair: Keypair
  index: number
}

export type GetCashedEventsPayload = {
  storeName: string
  privateKey: string
  publicKey: BigNumber
}

export type BatchEventPayload = {
  blockFrom: number
  blockTo: number
  cachedEvents: CommitmentEvents
  keypair: Keypair
  index: number
}

export type BatchEventsPayload = {
  blockTo: number
  blockFrom: number
  privateKey: string
  publicKey: BigNumber
  withCache?: boolean
  cachedEvents: CommitmentEvents
}
