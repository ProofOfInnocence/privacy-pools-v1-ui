// import { ChainId } from '@/types'
// import { IndexDBStores } from '@/services/idb/@types'
// import { getAllAccounts } from '@/services'

// import { CHAINS, numbers, L1_CHAIN_ID } from '@/constants'
// import { isEmpty, sleep, toChecksumAddress } from '@/utilities'
// import { getBridgeHelper, getBridgeProxy, getAmbBridge } from '@/contracts'

// import { EventsClass, GetAffirmationParams, GetRelayedMessageParams, SaveEventsParams } from './@types'

// class EventAggregator implements EventsClass {
//   public async getBackupedAddressFromPublicKey(publicKey: string) {
//     try {
//       const chainId = L1_CHAIN_ID
//       let blockFrom = CHAINS[chainId].deployBlock

//       const cachedAccountsByPublicKey = await window.$nuxt.$indexedDB.getAllFromIndex({
//         indexName: 'key',
//         storeName: `${IndexDBStores.ACCOUNT_EVENTS}_${chainId}`,
//         key: publicKey,
//       })

//       // @ts-expect-error
//       const [lastAccount] = cachedAccountsByPublicKey.sort((a, b) => a.blockNumber - b.blockNumber).slice(-numbers.ONE)

//       if (lastAccount) {
//         return lastAccount.owner
//       }

//       const cachedEvents = await window.$nuxt.$indexedDB.getAll({
//         storeName: `${IndexDBStores.ACCOUNT_EVENTS}_${chainId}`,
//       })

//       if (cachedEvents?.length) {
//         const [latestEvent] = cachedEvents.slice(-numbers.ONE)
//         blockFrom = Number(latestEvent.blockNumber) + numbers.ONE
//       }

//       const { events: graphEvents, lastSyncBlock } = await getAllAccounts({ fromBlock: blockFrom, chainId })

//       const [account] = graphEvents.filter((e: { key: string }) => e.key === publicKey)

//       if (account) {
//         this.saveEvents({
//           chainId,
//           events: graphEvents,
//           storeName: IndexDBStores.ACCOUNT_EVENTS,
//         })
//         return account.owner
//       }

//       if (lastSyncBlock) {
//         blockFrom = lastSyncBlock
//       }

//       const bridgeHelper = getBridgeHelper(chainId)

//       const filter = bridgeHelper.filters.PublicKey()
//       const rpcEvents = await bridgeHelper.queryFilter(filter, blockFrom)

//       const accountEvents = rpcEvents.map((e: { args: { key: string; owner: string }; blockNumber: number }) => {
//         return {
//           key: e.args.key,
//           owner: toChecksumAddress(e.args.owner),
//           blockNumber: e.blockNumber,
//         }
//       })

//       const newEvents = graphEvents.concat(accountEvents)

//       this.saveEvents({
//         chainId,
//         events: newEvents,
//         storeName: IndexDBStores.ACCOUNT_EVENTS,
//       })

//       const events = cachedEvents.concat(newEvents).filter((e: { key: string }) => e.key === publicKey)

//       if (isEmpty(events)) {
//         return undefined
//       }

//       // @ts-expect-error
//       const [event] = events.sort((a, b) => a.blockNumber - b.blockNumber).slice(-numbers.ONE)

//       return event.owner
//     } catch (err) {
//       return undefined
//     }
//   }

//   public async getAccountAddress(address: string) {
//     try {
//       const chainId = L1_CHAIN_ID
//       let blockFrom = CHAINS[chainId].deployBlock

//       const cachedAccountsByOwner = await window.$nuxt.$indexedDB.getAllFromIndex({
//         indexName: 'owner',
//         storeName: `${IndexDBStores.ACCOUNT_EVENTS}_${chainId}`,
//         key: toChecksumAddress(address),
//       })

//       // @ts-expect-error
//       const [lastAccount] = cachedAccountsByOwner.sort((a, b) => a.blockNumber - b.blockNumber).slice(-numbers.ONE)

//       if (lastAccount) {
//         return lastAccount.key
//       }

//       const cachedEvents = await window.$nuxt.$indexedDB.getAll({
//         storeName: `${IndexDBStores.ACCOUNT_EVENTS}_${chainId}`,
//       })

//       if (cachedEvents?.length) {
//         const [latestEvent] = cachedEvents.slice(-numbers.ONE)
//         blockFrom = Number(latestEvent.blockNumber) + numbers.ONE
//       }

//       const { events: graphEvents, lastSyncBlock } = await getAllAccounts({ fromBlock: blockFrom, chainId })

//       const [account] = graphEvents.filter((e: { owner: string }) => toChecksumAddress(e.owner) === toChecksumAddress(address))

//       if (account) {
//         this.saveEvents({
//           chainId,
//           events: graphEvents,
//           storeName: IndexDBStores.ACCOUNT_EVENTS,
//         })
//         return account.key
//       }

//       if (lastSyncBlock) {
//         blockFrom = lastSyncBlock
//       }

//       const bridgeHelper = getBridgeHelper(chainId)

//       const filter = bridgeHelper.filters.PublicKey()
//       const rpcEvents = await bridgeHelper.queryFilter(filter, blockFrom)

//       const accountEvents = rpcEvents.map((e: { args: { key: string; owner: string }; blockNumber: number }) => {
//         return {
//           key: e.args.key,
//           owner: toChecksumAddress(e.args.owner),
//           blockNumber: e.blockNumber,
//         }
//       })

//       const newEvents = graphEvents.concat(accountEvents)

//       this.saveEvents({
//         chainId,
//         events: newEvents,
//         storeName: IndexDBStores.ACCOUNT_EVENTS,
//       })

//       const events = cachedEvents
//         .concat(newEvents)
//         .filter((e: { owner: string }) => toChecksumAddress(e.owner) === toChecksumAddress(address))

//       if (isEmpty(events)) {
//         return undefined
//       }

//       // @ts-expect-error
//       const [event] = events.sort((a, b) => a.blockNumber - b.blockNumber).slice(-numbers.ONE)

//       return event.key
//     } catch (err) {
//       return undefined
//     }
//   }

//   // @ts-expect-error
//   public async getRelayedMessage({ messageId, blockFrom = numbers.ZERO, attempt = numbers.ONE }: GetRelayedMessageParams) {
//     try {
//       const ambBridge = getBridgeProxy(L1_CHAIN_ID)
//       const callRetryAttempt = 150

//       if (!blockFrom) {
//         // TODO save block number after start processing transaction
//         blockFrom = await ambBridge.provider.getBlockNumber()
//         blockFrom = blockFrom - Number('100')
//       }

//       const filter = ambBridge.filters.RelayedMessage(null, null, messageId)
//       const events = await ambBridge.queryFilter(filter, blockFrom)

//       if (!isEmpty(events)) {
//         return events
//       } else if (attempt >= callRetryAttempt) {
//         return []
//       } else {
//         attempt++
//         await sleep(numbers.SECOND * numbers.THREE)
//         return this.getRelayedMessage({ messageId, blockFrom, attempt })
//       }
//     } catch (err) {
//       attempt++
//       await sleep(numbers.SECOND * numbers.TEN)
//       return this.getRelayedMessage({ messageId, blockFrom, attempt })
//     }
//   }

//   // @ts-expect-error
//   public async getAffirmationCompleted({ messageId, blockFrom = numbers.ZERO, attempt = numbers.ONE }: GetAffirmationParams) {
//     try {
//       const ambBridge = getAmbBridge(ChainId.XDAI)
//       const callRetryAttempt = 150

//       if (!blockFrom) {
//         // TODO save block number after start processing transaction
//         blockFrom = await ambBridge.provider.getBlockNumber()
//         blockFrom = blockFrom - Number('100')
//       }

//       const filter = ambBridge.filters.AffirmationCompleted(null, null, messageId)
//       const events = await ambBridge.queryFilter(filter, blockFrom)

//       if (!isEmpty(events)) {
//         return events
//       } else if (attempt >= callRetryAttempt) {
//         return []
//       } else {
//         attempt++
//         await sleep(numbers.SECOND * numbers.THREE)
//         return this.getAffirmationCompleted({ messageId, attempt })
//       }
//     } catch (err) {
//       attempt++
//       await sleep(numbers.SECOND * numbers.TEN)
//       return this.getAffirmationCompleted({ messageId, attempt })
//     }
//   }

//   // @ts-expect-error
//   public async getUserRequestForSignature({ blockFrom, messageId, attempt = numbers.ONE }: GetAffirmationParams) {
//     try {
//       const ambBridge = getAmbBridge(ChainId.XDAI)
//       const callRetryAttempt = 150

//       const filter = ambBridge.filters.UserRequestForSignature(messageId)
//       const events = await ambBridge.queryFilter(filter, blockFrom)

//       if (!isEmpty(events)) {
//         return events
//       } else if (attempt >= callRetryAttempt) {
//         return []
//       } else {
//         attempt++
//         await sleep(numbers.SECOND * numbers.THREE)
//         return this.getUserRequestForSignature({ blockFrom, attempt })
//       }
//     } catch (err) {
//       attempt++
//       await sleep(numbers.SECOND * numbers.TEN)
//       return this.getUserRequestForSignature({ blockFrom, attempt })
//     }
//   }

//   // @ts-expect-error
//   public async getUserRequestForAffirmation({ messageId, blockFrom, attempt = numbers.ONE }: GetAffirmationParams) {
//     try {
//       const bridge = getBridgeProxy(L1_CHAIN_ID)
//       const callRetryAttempt = 150

//       const filter = bridge.filters.UserRequestForAffirmation(messageId)
//       const events = await bridge.queryFilter(filter, blockFrom)

//       if (!isEmpty(events)) {
//         return events
//       } else if (attempt >= callRetryAttempt) {
//         return []
//       } else {
//         attempt++
//         await sleep(numbers.SECOND * numbers.THREE)
//         return this.getUserRequestForAffirmation({ blockFrom, attempt })
//       }
//     } catch (err) {
//       attempt++
//       await sleep(numbers.SECOND * numbers.TEN)
//       return this.getUserRequestForAffirmation({ blockFrom, attempt })
//     }
//   }

//   saveEvents({ events, storeName, chainId }: SaveEventsParams) {
//     try {
//       if (window.$nuxt.$indexedDB.isBlocked || isEmpty(events)) {
//         return
//       }

//       window.$nuxt.$indexedDB.createMultipleTransactions({
//         data: events,
//         storeName: `${storeName}_${chainId}`,
//       })
//     } catch (err) {
//       console.error(`saveEvents has error: ${err.message}`)
//     }
//   }
// }

// const eventService = new EventAggregator()

// export { eventService }
export {}