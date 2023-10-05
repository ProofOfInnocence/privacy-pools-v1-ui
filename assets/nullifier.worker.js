/* eslint-disable @typescript-eslint/no-require-imports */
const { isEmpty } = require('lodash')
const { BigNumber } = require('ethers')

const { IndexedDB } = require('../services/idb')
const { sleep } = require('../utilities/helpers')
const { workerEvents, numbers } = require('../constants/worker')
const { ExtendedProvider } = require('../services/ether/ExtendedProvider')

const { POOL_CONTRACT, RPC_LIST, FALLBACK_RPC_LIST } = require('../constants/contracts')
const { TornadoPool__factory: TornadoPoolFactory } = require('../_contracts')

const getProviderWithSigner = (chainId) => {
  return new ExtendedProvider(RPC_LIST[chainId], chainId, FALLBACK_RPC_LIST[chainId])
}

const initDataBase = async () => {
  try {
    const options = {
      stores: [
        {
          keyPath: 'nullifier',
          name: `nullifier_events_100`,
          indexes: [{ name: 'transactionHash', unique: false }],
        },
      ],
      dbName: 'tornado_pool_nullifier',
    }

    const instance = new IndexedDB(options)

    await instance.initDB()

    self.$indexedDB = instance
  } catch (err) {
    console.log('err', err.message)
  }
}

const initWorker = (chainId) => {
  self.chainId = chainId

  const provider = getProviderWithSigner(chainId)

  setTornadoPool(chainId, provider)
  initDataBase()
}

const setTornadoPool = (chainId, provider) => {
  self.poolContract = TornadoPoolFactory.connect(POOL_CONTRACT[chainId], provider)
}

const saveEvents = async ({ events }) => {
  try {
    const isIdbEnable = await getIsDBEnabled()
    if (isIdbEnable || !getIsWhitelistedDomain() || isEmpty(events)) {
      return
    }

    self.$indexedDB.createMultipleTransactions({
      data: events,
      storeName: 'nullifier_events_100',
    })
  } catch (err) {
    console.error(`saveEvents has error: ${err.message}`)
  }
}

const checkUnspent = async (decryptedEvent, nullifierEvents) => {
  try {
    const { nullifierHash } = decryptedEvent
    const isIdbEnable = await getIsDBEnabled()

    if (isIdbEnable) {
      const lastEvent = await self.$indexedDB.getFromIndex({
        key: nullifierHash,
        indexName: 'nullifier',
        storeName: 'nullifier_events_100',
      })

      if (lastEvent) {
        return undefined
      }
    }

    const event = nullifierEvents.find((event) => {
      return event.nullifier === nullifierHash
    })

    if (event) {
      return undefined
    }
    return decryptedEvent
  } catch (err) {
    throw new Error(`Method getNullifierEvent has error: ${err.message}`)
  }
}

const getCachedEvents = async () => {
  let blockFrom = numbers.DEPLOYED_BLOCK

  if (!self.$indexedDB) {
    await sleep(numbers.RECALL_DELAY)
  }

  const cachedEvents = await self.$indexedDB.getAll({
    storeName: 'nullifier_events_100',
  })

  if (cachedEvents && cachedEvents.length) {
    const [latestEvent] = cachedEvents.sort((a, b) => b.blockNumber - a.blockNumber)
    const currentBlock = await self.poolContract.provider.getBlockNumber()
    const newBlockFrom = Number(latestEvent.blockNumber) + numbers.ONE

    if (latestEvent.blockNumber === currentBlock) {
      return { blockFrom, cachedEvents }
    }
    blockFrom = newBlockFrom > currentBlock ? currentBlock : newBlockFrom
  }

  return { blockFrom, cachedEvents }
}

const getNullifiers = async (blockFrom) => {
  try {
    const filter = self.poolContract.filters.NewNullifier()
    const events = await self.poolContract.queryFilter(filter, blockFrom)

    return events.map(({ blockNumber, transactionHash, args }) => ({
      blockNumber,
      transactionHash,
      nullifier: args.nullifier,
    }))
  } catch (err) {
    console.error('getNullifiers', err.message)
    return []
  }
}

const getNullifierEvents = async (cachedNullifiers, withCache = true) => {
  let cached = { blockFrom: numbers.DEPLOYED_BLOCK, cachedEvents: [] }
  try {
    if (cachedNullifiers && cachedNullifiers.length) {
      const [latestEvent] = cachedNullifiers.sort((a, b) => b.blockNumber - a.blockNumber)
      const currentBlock = await self.poolContract.provider.getBlockNumber()
      const newBlockFrom = Number(latestEvent.blockNumber) + numbers.ONE

      if (latestEvent.blockNumber === currentBlock) {
        cached.blockFrom = numbers.DEPLOYED_BLOCK
      }
      cached.blockFrom = newBlockFrom > currentBlock ? currentBlock : newBlockFrom
      cached.cachedEvents = cachedNullifiers
    } else {
      cached = await getCachedEvents()
    }
    const { blockFrom = numbers.DEPLOYED_BLOCK, cachedEvents = [] } = cached

    const nullifiers = await getNullifiers(blockFrom)

    if (nullifiers.length) {
      saveEvents({ events: nullifiers })
    }
    return withCache ? cachedEvents.concat(nullifiers) : nullifiers
  } catch (err) {
    throw new Error(`Method getNullifierEvents has error: ${err.message}`)
  }
}

const checkUnspentEvents = async ({ cachedNullifiers, decryptedEvents }) => {
  try {
    if (decryptedEvents.length === numbers.ZERO) {
      return {
        unspentUtxo: [],
        totalAmount: 0,
      }
    }

    const nullifierEvents = await getNullifierEvents(cachedNullifiers)

    let totalAmount = BigNumber.from('0')
    const unspentUtxo = []

    const unspentEvents = await Promise.all(decryptedEvents.map((event) => checkUnspent(event, nullifierEvents)))

    unspentEvents.forEach((event) => {
      if (event && !BigNumber.from(event.amount).isZero()) {
        unspentUtxo.push(event)
        totalAmount = totalAmount.add(event.amount)
      }
    })

    return { totalAmount, unspentUtxo }
  } catch (err) {
    throw new Error(`Method checkUnspentEvents has error: ${err.message}`)
  }
}

const getNullifierEventsFromTxHash = async ({ cachedNullifiers, txHash }, [getUnspentPort]) => {
  try {
    const lastEvents = await self.$indexedDB.getAllFromIndex({
      key: txHash.toLowerCase(),
      indexName: 'transactionHash',
      storeName: 'nullifier_events_100',
    })

    if (lastEvents && lastEvents.length > numbers.ZERO) {
      getUnspentPort.postMessage({ result: lastEvents })
      return
    }

    const nullifierEvents = await getNullifierEvents(cachedNullifiers, true)
    const findingEvents = nullifierEvents.filter((event) => {
      return event.transactionHash.toLowerCase() === txHash.toLowerCase()
    })

    getUnspentPort.postMessage({ result: findingEvents })
  } catch (err) {
    getUnspentPort.postMessage({ errorMessage: err.message })
  }
}

const getNullifierEvent = async ({ cachedNullifiers, nullifierHash }, [getUnspentPort]) => {
  try {
    const lastEvent = await self.$indexedDB.getFromIndex({
      key: nullifierHash,
      indexName: 'nullifier',
      storeName: 'nullifier_events_100',
    })

    if (lastEvent) {
      getUnspentPort.postMessage({ result: lastEvent })
      return
    }

    const events = await getNullifierEvents(cachedNullifiers)

    const [event] = events.filter((event) => {
      return event.nullifier === nullifierHash
    })

    getUnspentPort.postMessage({ result: event })
  } catch (err) {
    getUnspentPort.postMessage({ errorMessage: err.message })
  }
}

const updateNullifierEvents = async (cachedNullifiers, [getUnspentPort]) => {
  try {
    const events = await getNullifierEvents(cachedNullifiers)
    getUnspentPort.postMessage({ result: events })
  } catch (err) {
    getUnspentPort.postMessage({ errorMessage: err.message })
  }
}

const getUnspentEvents = async ({ decryptedEvents, cachedNullifiers }, [getUnspentPort]) => {
  try {
    const unspentEvents = await checkUnspentEvents({ decryptedEvents, cachedNullifiers })

    getUnspentPort.postMessage({ result: unspentEvents })
  } catch (err) {
    getUnspentPort.postMessage({ errorMessage: err.message })
  }
}

const listener = ({ data, ports }) => {
  self.postMessage(data)
  switch (data.eventName) {
    case workerEvents.INIT_WORKER:
      initWorker(data.payload)
      break
    case workerEvents.GET_NULLIFIER_EVENT:
      getNullifierEvent(data.payload, ports)
      break
    case workerEvents.UPDATE_NULLIFIER_EVENTS:
      updateNullifierEvents(data.payload, ports)
      break
    case workerEvents.GET_UNSPENT_EVENTS:
      getUnspentEvents(data.payload, ports)
      break
    case workerEvents.GET_NULLIFIER_EVENTS_FROM_TX_HASH:
      getNullifierEventsFromTxHash(data.payload, ports)
      break
  }
}

// helpers
const getIsDBEnabled = async () => {
  if (!self.$indexedDB) {
    await sleep(numbers.RECALL_DELAY)
  }
  return !self.$indexedDB || self.$indexedDB.isBlocked
}

const getIsWhitelistedDomain = () => {
  const domainWhiteList = ['localhost:3000', 'nova.tornadocash.eth', 'nova.tornadocash.eth.link', 'nova.tornadocash.eth.limo']

  if (self.location.host.includes('compassionate-payne-b9dc6b.netlify.app')) {
    return true
  }
  return domainWhiteList.includes(self.location.host)
}

self.addEventListener('message', listener, false)
