import { ChainId } from '@/types'
import { getIPFSPrefix } from '@/utilities'
import { workerEvents, numbers } from '@/constants/worker'

import { BaseKeypair } from '@/services/core/@types'
import { CommitmentEvents, NullifierEvents, TxRecordEvents } from '@/services/events/@types'

import { EventsPayload, DecryptedEvents, GetEventsFromTxHashParams } from './@types'

// import '@/assets/events.worker.js'
// import '@/assets/nullifier.worker.js'

import NWorker from '@/assets/nullifier.worker.js'
import EWorker from '@/assets/events.worker.js'
import VWorker from '@/assets/nova.worker.js'
// const HARDWARE_CORESS = window.navigator.hardwareConcurrency

export interface WorkerProvider {
  workerSetup: (chainId: ChainId) => void
  getCommitmentEvents: () => Promise<CommitmentEvents>
  getTxRecordEvents: () => Promise<TxRecordEvents>
  getNullifierEventsFromTxHash: (nullifiers: NullifierEvents, txHash: string) => Promise<NullifierEvents>
  getDecryptedEventsFromTxHash: (keypair: BaseKeypair, txHash: string) => Promise<DecryptedEvents>
  generate_public_parameters: () => Promise<string>
  prove_membership: (inputjson: string, startjson: string) => Promise<string>
  // channels
  readonly openNovaChannel: <P, R>(eventName: string, payload: P, workerIndex?: number) => Promise<R>
  readonly openNullifierChannel: <P, R>(eventName: string, payload: P, workerIndex?: number) => Promise<R>
  readonly openEventsChannel: <P, R>(eventName: string, payload: P, workerIndex?: number) => Promise<R>
  // workers
  readonly nullifierWorkers: Worker[]
  readonly eventsWorkers: Worker[]
  readonly novaWorkers: Worker[]
}

const MIN_CORES = 2
const WORKERS_TYPES = 2
const HARDWARE_CORES = 2
const AVAILABLE_CORES = HARDWARE_CORES / WORKERS_TYPES || MIN_CORES
const CORES = Math.max(AVAILABLE_CORES, MIN_CORES)

class Provider implements WorkerProvider {
  public readonly nullifierWorkers: Worker[]
  public readonly eventsWorkers: Worker[]
  public readonly novaWorkers: Worker[]

  public constructor() {
    if (process.browser) {
      // const basePath = window.location.origin
      // console.log(`${basePath}/nullifier.worker.js`)
      // this.nullifierWorkers = new Array(CORES).fill('').map(() => new Worker(`${basePath}/nullifier.worker.js`))
      // this.eventsWorkers = new Array(CORES).fill('').map(() => new Worker(`${basePath}/events.worker.js`))

      // @ts-expect-error
      this.nullifierWorkers = new Array(CORES).fill('').map(() => new NWorker())
      // @ts-expect-error
      this.eventsWorkers = new Array(CORES).fill('').map(() => new EWorker())
      const CORESX = 1
      // @ts-expect-error
      this.novaWorkers = new Array(CORESX).fill('').map(() => new VWorker())
    }
  }

  public workerSetup = (chainId: ChainId) => {
    console.log('Worker setup has been called')
    try {
      const params = { eventName: workerEvents.INIT_WORKER, payload: chainId }
      this.nullifierWorkers.forEach((worker) => worker.postMessage(params))
      this.eventsWorkers.forEach((worker) => worker.postMessage(params))
      this.novaWorkers.forEach((worker) => worker.postMessage(params))
    } catch (err) {
      console.error('workerSetup has error: ', err.message)
    }
  }

  public generate_public_parameters = async (): Promise<string> => {
    try {
      let pp = await this.openNovaChannel<{ mode: number; pp_path: string; base: string }, string>(workerEvents.GENERATE_PP, {
        mode: 2,
        pp_path: 'poi-pp-22.cbor',
        base: window.location.origin,
      })
      return pp
    } catch (err) {
      throw new Error(`Nova worker method generate public parameters function has error: ${err}`)
    }
  }

  public prove_membership = async (inputjson: string, startjson: string): Promise<string> => {
    try {
      const proof = await this.openNovaChannel<
        { r1cs_path: string; wasm_path: string; mode: number; input_path_or_str: string; start_path_or_str: string; base: string },
        string
      >(workerEvents.PROVE, {
        r1cs_path: 'poi-22.r1cs',
        wasm_path: 'poi-22.wasm',
        mode: 1,
        input_path_or_str: inputjson,
        start_path_or_str: startjson,
        base: window.location.origin,
      })
      return proof
    } catch (err) {
      throw new Error(`Nova worker method prove function has error: ${err}`)
    }
  }

  public getCommitmentEvents = async (lastSyncBlock?: number): Promise<CommitmentEvents> => {
    try {
      const commitmentEvents = await this.openEventsChannel<EventsPayload, CommitmentEvents>(workerEvents.GET_COMMITMENT_EVENTS, {
        lastSyncBlock,
        withCache: true,
      })

      return commitmentEvents
    } catch (err) {
      throw new Error(`Events worker method getCommitmentEvents has error: ${err}`)
    }
  }

  public getTxRecordEvents = async (lastSyncBlock?: number): Promise<TxRecordEvents> => {
    try {
      const txRecordEvents = await this.openEventsChannel<EventsPayload, TxRecordEvents>(workerEvents.GET_TX_RECORD_EVENTS, {
        lastSyncBlock,
        withCache: true,
      })

      return txRecordEvents
    } catch (err) {
      throw new Error(`Events worker method getTxRecordEvents has error: ${err}`)
    }
  }

  public getNullifierEventsFromTxHash = async (nullifiers: NullifierEvents, txHash: string): Promise<NullifierEvents> => {
    try {
      const nullifierEvents = await this.openNullifierChannel<NullifierEvents, { cachedNullifiers: NullifierEvents; txHash: string }>(
        workerEvents.GET_NULLIFIER_EVENTS_FROM_TX_HASH,
        { cachedNullifiers: nullifiers, txHash }
      )

      return nullifierEvents
    } catch (err) {
      throw new Error(`Events worker method getNullifierEventsFromTxHash has error: ${err}`)
    }
  }

  public getDecryptedEventsFromTxHash = async (keypair: BaseKeypair, txHash: string): Promise<DecryptedEvents> => {
    try {
      const decrypted = await this.openEventsChannel<GetEventsFromTxHashParams, DecryptedEvents>(workerEvents.GET_EVENTS_FROM_TX_HASH, {
        txHash,
        publicKey: keypair.pubkey,
        privateKey: keypair.privkey,
      })

      return decrypted
    } catch (err) {
      throw new Error(`Events worker method getDecryptedEventsFromTxHash has error: ${err}`)
    }
  }

  public getNullifierEvent = async (cachedNullifiers: NullifierEvents, nullifierHash: string) => {
    try {
      const nullifierEvent = await this.openNullifierChannel(workerEvents.GET_NULLIFIER_EVENT, {
        cachedNullifiers,
        nullifierHash,
      })

      if (!nullifierEvent) {
        return undefined
      }

      return nullifierEvent
    } catch (err) {
      throw new Error(`Events worker method getNullifierEvent has error: ${err}`)
    }
  }

  public readonly openNovaChannel = async <P, R>(eventName: string, payload: P, workerIndex = numbers.ZERO) => {
    return await new Promise<R>((resolve, reject) => {
      const novaChannel = new MessageChannel()
      novaChannel.port1.onmessage = ({ data }) => {
        const { result, errorMessage = 'unknown error' } = data
        novaChannel.port1.close()
        if (result) {
          resolve(result)
        } else {
          reject(errorMessage)
        }
      }
      this.novaWorkers[workerIndex].postMessage({ eventName, payload }, [novaChannel.port2])
    })
  }

  public readonly openNullifierChannel = async <R, P>(eventName: string, payload: P, workerIndex = numbers.ZERO) => {
    const result: R = await new Promise((resolve, reject) => {
      const nullifierChannel = new MessageChannel()

      nullifierChannel.port1.onmessage = ({ data }) => {
        const { result, errorMessage = 'unknown error' } = data
        nullifierChannel.port1.close()
        if (result) {
          resolve(result)
        } else {
          reject(errorMessage)
        }
      }

      this.nullifierWorkers[workerIndex].postMessage({ eventName, payload }, [nullifierChannel.port2])
    })

    return result
  }

  public readonly openEventsChannel = async <P, R>(eventName: string, payload: P, workerIndex = numbers.ZERO) => {
    return await new Promise<R>((resolve, reject) => {
      const eventsChannel = new MessageChannel()

      eventsChannel.port1.onmessage = ({ data }) => {
        const { result, errorMessage = 'unknown error' } = data
        eventsChannel.port1.close()
        if (result) {
          resolve(result)
        } else {
          reject(errorMessage)
        }
      }

      this.eventsWorkers[workerIndex].postMessage({ eventName, payload }, [eventsChannel.port2])
    })
  }
}

const workerProvider: WorkerProvider = new Provider()

export { workerProvider }
