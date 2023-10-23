import { BigNumber } from 'ethers'
import { ChainId } from '@/types'
import {
  CachedData,
  CachedEvents,
  GetUtxoPayload,
  DecryptedHashes,
  UnspentUtxoData,
  BatchEventPayload,
  BatchEventsPayload,
  RestoreUtxoPayload,
  FetchUnspentUtxoRes,
  GetFreshUtxoPayload,
  UnspentUtxoDataBatch,
  GetBatchUtxoPayload,
  GetCashedEventsPayload,
  FetchBatchUtxoPayload,
} from './@types'

import { PrivacyPool as TornadoPool } from '@/_contracts'
import { getTornadoPool } from '@/contracts'

import { BG_ZERO } from '@/constants'
import { numbers, workerEvents } from '@/constants/worker'

import { getBlocksBatches, controlledPromise, uniqBy } from '@/utilities'

import { CustomUtxo } from '@/services/core/@types'
import { Keypair, Utxo, workerProvider } from '@/services'
import {
  UnspentData,
  DecryptedEvents,
  GetUnspentEvents,
  GetDecryptedEvents,
  GetDecryptBatchData,
  GetUnspentUtxoPayload,
  GetFreshUnspentUtxoRes,
} from '@/services/worker/@types'
import { CommitmentEvents, NullifierEvents } from '@/services/events/@types'

export interface UtxoService {
  restoreUnspentUtxo: ({ keypair, callback }: RestoreUtxoPayload) => Promise<CachedData>
  fetchUnspentUtxo: ({ keypair, callbacks }: GetUtxoPayload) => Promise<FetchUnspentUtxoRes>
}

class Service implements UtxoService {
  public poolContract: TornadoPool
  public promises: {
    [key in string]: null | {
      promise: Promise<FetchUnspentUtxoRes>
      resolve: (value: FetchUnspentUtxoRes | PromiseLike<FetchUnspentUtxoRes>) => void
      reject: (value: Error) => void
    }
  }

  private latestBlock: number
  private decrypted: DecryptedEvents
  private nullifiers: NullifierEvents
  private readonly accountAddress: string

  public static async getCachedData(currentBlock: number, keypair: Keypair): Promise<CachedEvents> {
    try {
      const cachedEvents = await workerProvider.openEventsChannel<GetCashedEventsPayload, GetDecryptedEvents>(
        workerEvents.GET_CACHED_EVENTS,
        {
          publicKey: keypair.pubkey,
          privateKey: keypair.privkey,
          storeName: 'decrypted_events_100',
        }
      )

      if (cachedEvents?.lastSyncBlock && cachedEvents?.decrypted?.length) {
        const newBlockFrom = Number(cachedEvents.lastSyncBlock) + numbers.ONE
        const latestBlock = newBlockFrom > currentBlock ? currentBlock : newBlockFrom

        return { ...cachedEvents, latestBlock }
      }

      return { latestBlock: numbers.DEPLOYED_BLOCK, commitments: [], decrypted: [] }
    } catch (err) {
      throw new Error(`getCachedData error: ${err}`)
    }
  }

  public static async getBatchEvents({ blockFrom, blockTo, cachedEvents, keypair, index }: BatchEventPayload) {
    try {
      const batchEvents = await workerProvider.openEventsChannel<BatchEventsPayload, GetDecryptedEvents>(
        workerEvents.GET_BATCH_EVENTS,
        { blockFrom, blockTo, publicKey: keypair.pubkey, cachedEvents, privateKey: keypair.privkey },
        index
      )

      return batchEvents
    } catch (err) {
      throw new Error(`getFreshData error: ${err}`)
    }
  }

  public constructor(chainId: ChainId, accountAddress: string, decrypted = [], nullifiers = [], latestBlock = numbers.DEPLOYED_BLOCK) {
    this.poolContract = getTornadoPool(chainId)
    this.promises = {}

    this.accountAddress = accountAddress
    this.decrypted = decrypted
    this.nullifiers = nullifiers
    this.latestBlock = latestBlock
  }

  public async getUnspentUtxo({ decryptedEvents, keypair, index }: GetUnspentUtxoPayload): Promise<UnspentUtxoData> {
    try {
      const { unspentUtxo, totalAmount } = await workerProvider.openNullifierChannel<GetUnspentEvents, UnspentData>(
        workerEvents.GET_UNSPENT_EVENTS,
        {
          decryptedEvents,
          cachedNullifiers: this.nullifiers,
        },
        index
      )

      return {
        accountAddress: this.accountAddress,
        totalAmount: BigNumber.from(totalAmount),
        unspentUtxo: unspentUtxo.map((customUtxo: CustomUtxo) => {
          const utxo = new Utxo({ ...customUtxo, keypair })
          utxo.transactionHash = customUtxo.transactionHash
          return utxo as CustomUtxo
        }),
      }
    } catch (err) {
      throw new Error(`getUnspentUtxo error: ${err}`)
    }
  }

  public async getBatchEventsData({ batch, decryptedEvents, keypair, index }: FetchBatchUtxoPayload): Promise<UnspentUtxoDataBatch> {
    const [from, to] = batch
    const { decrypted, commitments, decryptedHashes } = await Service.getBatchEvents({
      index,
      keypair,
      blockTo: to,
      blockFrom: from,
      cachedEvents: decryptedEvents,
    })

    const { totalAmount, unspentUtxo } = await this.getUnspentUtxo({ decryptedEvents: decrypted, keypair, index })

    return { totalAmount, unspentUtxo, decrypted, commitments, decryptedHashes }
  }

  public async getNullifierEventsFromTxHash(txHash: string): Promise<NullifierEvents> {
    try {
      return await workerProvider.getNullifierEventsFromTxHash(this.nullifiers, txHash)
    } catch (err) {
      throw new Error(`getNullifierEventsFromTxHash error: ${err}`)
    }
  }

  public async getCachedEventsData(keypair: Keypair, currentBlock: number): Promise<CachedData> {
    const { latestBlock, decrypted } = await Service.getCachedData(currentBlock, keypair)

    const decryptedEvents = decrypted?.length ? decrypted : this.decrypted

    const { totalAmount, unspentUtxo } = await this.getUnspentUtxo({
      keypair,
      decryptedEvents,
      index: numbers.ZERO,
    })

    return {
      totalAmount,
      unspentUtxo,
      decryptedEvents,
      accountAddress: this.accountAddress,
      latestBlock: decrypted?.length ? latestBlock : this.latestBlock,
    }
  }

  public async restoreUnspentUtxo({ keypair, callback }: RestoreUtxoPayload): Promise<CachedData> {
    const currentBlock = await this.poolContract.provider.getBlockNumber()

    const cachedData = await this.getCachedEventsData(keypair, currentBlock)
    callback({ totalAmount: cachedData.totalAmount, unspentUtxo: cachedData.unspentUtxo, accountAddress: this.accountAddress })
    return cachedData
  }

  public async getFreshUnspentUtxo({ keypair, cachedData, callback }: GetFreshUtxoPayload): Promise<GetFreshUnspentUtxoRes> {
    console.log('servies/utxoService/index.ts: getFreshUnspentUtxo')
    const currentBlock = await this.poolContract.provider.getBlockNumber()
    const interval = currentBlock - cachedData.latestBlock

    let batchesCount = workerProvider.eventsWorkers.length
    if (interval <= numbers.MIN_BLOCKS_INTERVAL_LINE) {
      batchesCount = numbers.TWO
    }

    const batches = getBlocksBatches(cachedData.latestBlock, currentBlock, batchesCount).reverse()
    const promises = batches.map(
      // eslint-disable-next-line
      (batch, index) => this.fetchUnspentUtxoBatch({ batch, index, keypair, callback, decryptedEvents: cachedData.decryptedEvents })
    )

    const freshBatchesData = await Promise.all(promises)
    console.log("servies/utxoService/index.ts: getFreshUnspentUtxo: freshBatchesData", freshBatchesData)

    workerProvider.openEventsChannel<{ storeName: string; data: CommitmentEvents }, null>(workerEvents.SAVE_EVENTS, {
      storeName: 'commitment_events_100',
      data: freshBatchesData.map((el) => el.commitments).flat(),
    })

    workerProvider.openEventsChannel<{ storeName: string; data: DecryptedHashes }, null>(workerEvents.SAVE_EVENTS, {
      storeName: 'decrypted_events_100',
      data: freshBatchesData.map((el) => el.decryptedHashes).flat(),
    })

    return { freshBatchesData, lastBlock: currentBlock }
  }

  public async fetchUnspentUtxo({ keypair, callbacks }: GetUtxoPayload): Promise<FetchUnspentUtxoRes> {
    console.log('servies/utxoService/index.ts: fetchUnspentUtxo')
    const knownPromise = this.promises[keypair.pubkey._hex]?.promise

    if (knownPromise) {
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

    const controlled = controlledPromise<FetchUnspentUtxoRes>(this.fetchData({ keypair, callbacks }))
    this.promises[keypair.pubkey._hex] = controlled

    return await controlled.promise
  }

  private async fetchData({ keypair, callbacks }: GetUtxoPayload): Promise<FetchUnspentUtxoRes> {
    console.log('servies/utxoService/index.ts: fetchData')
    try {
      this.nullifiers = await workerProvider.openNullifierChannel<NullifierEvents, NullifierEvents>(
        workerEvents.UPDATE_NULLIFIER_EVENTS,
        this.nullifiers
      )
      console.log("servies/utxoService/index.ts: fetchData: this.nullifiers", this.nullifiers)

      const cachedData = await this.restoreUnspentUtxo({ keypair, callback: callbacks.set })

      console.log("servies/utxoService/index.ts: fetchData: cachedData", cachedData)

      const { freshBatchesData, lastBlock } = await this.getFreshUnspentUtxo({ keypair, cachedData, callback: callbacks.update })

      console.log("servies/utxoService/index.ts: fetchData: freshBatchesData", freshBatchesData)
      console.log("servies/utxoService/index.ts: fetchData: lastBlock", lastBlock)

      const accumulator = {
        totalAmount: cachedData.totalAmount,
        unspentUtxo: [],
        decrypted: [],
        commitments: [],
        decryptedHashes: [],
      }
      const freshData = freshBatchesData.reduce(this.compileData, accumulator)
      if (lastBlock) {
        await workerProvider.openEventsChannel<{ lastSyncBlock: number }, null>(workerEvents.SAVE_LAST_SYNC_BLOCK, {
          lastSyncBlock: lastBlock,
        })
      }
      this.latestBlock = lastBlock
      this.decrypted = uniqBy(cachedData.decryptedEvents.concat(freshData.decrypted), 'commitment._hex')

      return {
        totalAmount: freshData.totalAmount,
        freshUnspentUtxo: freshData.unspentUtxo,
        freshDecryptedEvents: freshData.decrypted,
        accountAddress: this.accountAddress,
        unspentUtxo: cachedData.unspentUtxo.concat(freshData.unspentUtxo),
      }
    } catch (err) {
      throw new Error(`getBalance error: ${err}`)
    } finally {
      this.promises[keypair.pubkey._hex] = null
    }
  }

  private async fetchUnspentUtxoBatch(payload: GetBatchUtxoPayload): Promise<GetDecryptBatchData> {
    const { totalAmount, unspentUtxo, decrypted, commitments, decryptedHashes } = await this.getBatchEventsData(payload)
    if (!this.promises[payload.keypair.pubkey._hex]) {
      return { totalAmount: BG_ZERO, unspentUtxo: [], decrypted: [], commitments: [], decryptedHashes: [] }
    }
    if (!totalAmount.isZero()) {
      payload.callback({ totalAmount, unspentUtxo, accountAddress: this.accountAddress })
    }
    return { totalAmount, unspentUtxo, decrypted, commitments, decryptedHashes }
  }

  private compileData(acc: UnspentUtxoDataBatch, { totalAmount, unspentUtxo, decrypted }: UnspentUtxoDataBatch) {
    acc.totalAmount = acc.totalAmount.add(totalAmount)
    acc.unspentUtxo = acc.unspentUtxo.concat(unspentUtxo)
    acc.decrypted = acc.decrypted.concat(decrypted)
    return acc
  }
}

class UtxoFactory {
  public instances = new Map()

  public getService = (chainId: ChainId, accountAddress: string) => {
    const key = `${chainId}_${accountAddress}`

    if (this.instances.has(key)) {
      return this.instances.get(key)
    }

    const instance = new Service(chainId, accountAddress)
    this.instances.set(key, instance)
    return instance
  }
}

const utxoFactory = new UtxoFactory()
export { utxoFactory }
