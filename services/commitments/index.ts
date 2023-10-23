import { PoolChainId } from '@/types'
import {
  FreshData,
  CachedData,
  BatchPayload,
  BatchEventPayload,
  BatchEventsPayload,
  GetFreshCommitments,
  GetCashedEventsPayload,
} from './@types'

import { PrivacyPool as TornadoPool } from '@/_contracts'
import { getTornadoPool } from '@/contracts'

import { numbers, workerEvents } from '@/constants/worker'
import { getBlocksBatches, controlledPromise } from '@/utilities'

import { Keypair } from '@/services'
import { CommitmentEvents } from '@/services/events/@types'
import { workerProvider } from '../worker'
import { GetDecryptedEvents } from '@/services/worker/@types'
export interface CommitmentsService {
  getCachedData: (keypair: Keypair) => Promise<CachedData>
  fetchCommitments: (keypair: Keypair) => Promise<CommitmentEvents>
  getFreshCommitments: (payload: GetFreshCommitments) => Promise<FreshData>
}

class Service implements CommitmentsService {
  public poolContract: TornadoPool
  private latestBlock: number
  private commitments: CommitmentEvents

  public promises: {
    [key in string]: null | {
      promise: Promise<CommitmentEvents>
      resolve: (value: CommitmentEvents | PromiseLike<CommitmentEvents>) => void
      reject: (value: Error) => void
    }
  }

  public static async getBatchEvents({ blockFrom, blockTo, cachedEvents, keypair, index }: BatchEventPayload) {
    try {
      const batchEvents = await workerProvider.openEventsChannel<BatchEventsPayload, GetDecryptedEvents>(
        workerEvents.GET_BATCH_EVENTS,
        { blockFrom, blockTo, cachedEvents, publicKey: keypair.pubkey, privateKey: keypair.privkey },
        index
      )

      return batchEvents
    } catch (err) {
      throw new Error(`getFreshData error: ${err}`)
    }
  }

  public static async getBatchEventsData({ batch, cachedEvents, keypair, index }: BatchPayload): Promise<CommitmentEvents> {
    const [from, to] = batch
    const { commitments } = await Service.getBatchEvents({
      index,
      keypair,
      blockTo: to,
      blockFrom: from,
      cachedEvents,
    })

    return commitments
  }

  public constructor(chainId: PoolChainId) {
    this.poolContract = getTornadoPool(chainId)
    this.promises = {}
    this.commitments = []
    this.latestBlock = numbers.DEPLOYED_BLOCK
  }

  public async getFreshCommitments({ keypair, latestBlock, commitments }: GetFreshCommitments): Promise<FreshData> {
    const currentBlock = await this.poolContract.provider.getBlockNumber()
    const interval = currentBlock - latestBlock

    let batchesCount = workerProvider.eventsWorkers.length
    if (interval <= numbers.MIN_BLOCKS_INTERVAL_LINE) {
      batchesCount = numbers.TWO
    }

    const batches = getBlocksBatches(latestBlock, currentBlock, batchesCount).reverse()

    const promises = batches.map(
      // eslint-disable-next-line
      (batch, index) => this.fetchCommitmentsBatch({ batch, index, keypair, cachedEvents: commitments })
    )

    const freshCommitments = await Promise.all<CommitmentEvents>(promises)
    return { freshCommitments: freshCommitments.flat(), lastBlock: currentBlock }
  }

  public async getCachedData(keypair: Keypair): Promise<CachedData> {
    try {
      const currentBlock = await this.poolContract.provider.getBlockNumber()
      console.log('Current block:', currentBlock);
      const cachedEvents = await workerProvider.openEventsChannel<GetCashedEventsPayload, GetDecryptedEvents>(
        workerEvents.GET_CACHED_COMMITMENTS_EVENTS,
        {
          publicKey: keypair.pubkey,
          privateKey: keypair.privkey,
          storeName: 'commitment_events_100',
        }
      )
      console.log("Cached Eventes ===== ", cachedEvents)

      if (cachedEvents?.lastSyncBlock && cachedEvents?.commitments?.length) {
        const newBlockFrom = Number(cachedEvents.lastSyncBlock) + numbers.ONE
        const latestBlock = newBlockFrom > currentBlock ? currentBlock : newBlockFrom

        return { ...cachedEvents, latestBlock }
      }
      return { latestBlock: this.latestBlock, commitments: this.commitments }
    } catch (err) {
      throw new Error(`getCachedData error: ${err}`)
    }
  }

  public async fetchCommitments(keypair: Keypair): Promise<CommitmentEvents> {
    console.log("Keypair hex:", keypair.pubkey._hex);
    const knownPromise = this.promises[keypair.pubkey._hex]?.promise

    if (knownPromise) {
      console.log('Known promise is called')
      return await knownPromise
    }

    Object.keys(this.promises).forEach((promiseKey) => {
      const promise = this.promises[promiseKey]

      if (promise) {
        promise.reject(new Error('Account was changed'))
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.promises[promiseKey]
      }
    })

    const controlled = controlledPromise<CommitmentEvents>(this.fetchData(keypair))
    this.promises[keypair.pubkey._hex] = controlled

    return await controlled.promise
  }

  private async fetchData(keypair: Keypair): Promise<CommitmentEvents> {
    try {
      console.log('Fetch data is called')
      const { latestBlock, commitments } = await this.getCachedData(keypair)
      console.log('Latest block:', latestBlock);
      console.log('Commitments:', commitments);

      const { freshCommitments, lastBlock } = await this.getFreshCommitments({ keypair, latestBlock, commitments })

      this.latestBlock = lastBlock
      this.commitments = commitments.concat(freshCommitments.flat())

      return this.commitments
    } catch (err) {
      throw new Error(`getBalance error: ${err}`)
    } finally {
      this.promises[keypair.pubkey._hex] = null
    }
  }

  private async fetchCommitmentsBatch(payload: BatchPayload): Promise<CommitmentEvents> {
    const commitments = await Service.getBatchEventsData(payload)
    if (!this.promises[payload.keypair.pubkey._hex]) {
      return []
    }
    return commitments
  }
}

class CommitmentsFactory {
  public instances = new Map()

  public getService = (chainId: PoolChainId) => {
    console.log('Get service is called')
    if (this.instances.has(chainId)) {
      return this.instances.get(chainId)
    }

    const instance = new Service(chainId)
    this.instances.set(chainId, instance)
    return instance
  }
}

const commitmentsFactory = new CommitmentsFactory()
export { commitmentsFactory }
