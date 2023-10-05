/* eslint-disable @typescript-eslint/no-require-imports */

const { AES, HmacSHA256, enc } = require('crypto-js')
const { isEmpty } = require('lodash')
const { BigNumber } = require('ethers')
const { poseidon } = require('@tornado/circomlib')
const { decrypt } = require('eth-sig-util')
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
          keyPath: 'index',
          name: `commitment_events_100`,
          indexes: [
            { name: 'transactionHash', unique: false },
            { name: 'commitment', unique: true },
          ],
        },
        {
          keyPath: 'id',
          name: `decrypted_events_100`,
          indexes: [{ name: 'hash', unique: true }],
        },
        {
          keyPath: 'name',
          name: `last_sync_event`,
          indexes: [{ name: 'name', unique: false }],
        },
      ],
      dbName: 'tornado_pool_events',
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
}
const setTornadoPool = (chainId, provider) => {
  self.poolContract = TornadoPoolFactory.connect(POOL_CONTRACT[chainId], provider)
}

const getCommitmentBatch = async ({ blockFrom, blockTo, cachedEvents, withCache }) => {
  const filter = self.poolContract.filters.NewCommitment()
  const events = await self.poolContract.queryFilter(filter, blockFrom, blockTo)

  const commitmentEvents = events.map(({ blockNumber, transactionHash, args }) => ({
    blockNumber,
    transactionHash,
    index: Number(args.index),
    commitment: args.commitment,
    encryptedOutput: args.encryptedOutput,
  }))

  return commitmentEvents.filter((el) => {
    if (!withCache && cachedEvents && cachedEvents.length) {
      return cachedEvents.find((cached) => {
        return el.transactionHash === cached.transactionHash && el.index === cached.index
      })
    }
    return true
  })
}
const getCommitments = async ({ withCache, lastSyncBlock }) => {
  try {
    let blockFrom = numbers.DEPLOYED_BLOCK

    if (!self.$indexedDB) {
      await sleep(numbers.RECALL_DELAY)
    }

    let cachedEvents = await self.$indexedDB.getAll({
      storeName: 'commitment_events_100',
    })

    if (!cachedEvents) {
      cachedEvents = []
    }

    if (!lastSyncBlock) {
      lastSyncBlock = await getLastSyncBlock()
    }
    const currentBlock = await self.poolContract.provider.getBlockNumber()

    if (lastSyncBlock && cachedEvents.length) {
      const newBlockFrom = Number(lastSyncBlock) + numbers.ONE

      if (Number(lastSyncBlock) === currentBlock) {
        return { commitmentEvents: cachedEvents }
      }
      blockFrom = newBlockFrom > currentBlock ? currentBlock : newBlockFrom
    }

    const commitmentEvents = await getCommitmentBatch({ blockFrom, blockTo: currentBlock, cachedEvents, withCache })

    return {
      newCommitmentEvents: commitmentEvents,
      commitmentEvents: withCache ? cachedEvents.concat(commitmentEvents) : commitmentEvents,
    }
  } catch (err) {
    throw new Error(`Method NEW getCommitmentEvents has error: ${err.message}`)
  }
}

const decryptCommitmentEvent = ({ commitmentEvent, privateKey, bgPublicKey }) => {
  const buf = keyPairDecrypt(commitmentEvent.encryptedOutput, privateKey)
  const index = BigNumber.from(commitmentEvent.index).toNumber()
  const amount = BigNumber.from('0x' + getHex(buf, numbers.ZERO, numbers.BYTES_31))
  const blinding = BigNumber.from('0x' + getHex(buf, numbers.BYTES_31, numbers.BYTES_62))

  const { commitment, nullifier } = getNullifier({
    index,
    amount,
    blinding,
    privateKey,
    publicKey: bgPublicKey,
  })

  const nullifierHash = nullifier._hex.slice(numbers.TWO).padStart(numbers.NULLIFIER_LENGTH, '0x00000')

  return {
    index,
    amount,
    blinding,
    nullifier,
    commitment,
    nullifierHash,
    blockNumber: commitmentEvent.blockNumber,
    transactionHash: commitmentEvent.transactionHash,
  }
}
const decryptCommitmentEvents = ({ publicKey, privateKey, commitmentEvents }) => {
  try {
    const decrypted = []
    const commitments = []

    const bgPublicKey = BigNumber.from(publicKey)

    for (const commitmentEvent of commitmentEvents) {
      try {
        const decryptedEvent = decryptCommitmentEvent({ commitmentEvent, privateKey, bgPublicKey })
        decrypted.push(decryptedEvent)
        commitments.push(commitmentEvent)
      } catch (err) {
        continue
      }
    }

    return { decrypted, commitments }
  } catch (err) {
    throw new Error(err.message)
  }
}

const getEvents = async ({ key, indexName, storeName }) => {
  try {
    const lastEvents = await self.$indexedDB.getAllFromIndex({ key, indexName, storeName })
    return lastEvents
  } catch (err) {
    throw new Error(`getEvents has error: ${err.message}`)
  }
}
const saveEvents = async ({ events, storeName }) => {
  try {
    const isIdbEnable = await getIsDBEnabled()

    if (isIdbEnable || !getIsWhitelistedDomain() || isEmpty(events)) {
      return
    }

    self.$indexedDB.createMultipleTransactions({
      storeName,
      data: events,
    })
  } catch (err) {
    console.error(`saveEvents has error: ${err.message}`)
  }
}

// listener handlers
const getCommitmentEvents = async ({ publicKey, lastSyncBlock, withCache = true }, [port]) => {
  try {
    const { commitmentEvents, newCommitmentEvents } = await getCommitments({ withCache, lastSyncBlock })

    port.postMessage({ result: commitmentEvents })
    saveEvents({ events: newCommitmentEvents, storeName: 'commitment_events_100' })
  } catch (err) {
    port.postMessage({ errorMessage: err.message })
  }
}

const getBatchCommitmentsEvents = async ({ blockFrom, blockTo, publicKey, privateKey, cachedEvents, withCache = true }, [port]) => {
  try {
    const commitments = await getCommitmentBatch({ blockFrom, blockTo, publicKey, cachedEvents, withCache })

    port.postMessage({ result: commitments })
    saveEvents({ events: commitments, storeName: 'commitment_events_100' })
  } catch (err) {
    port.postMessage({ errorMessage: err.message })
  }
}

const getBatchEvents = async ({ blockFrom, blockTo, publicKey, privateKey, cachedEvents, withCache = true }, [port]) => {
  try {
    const commitments = await getCommitmentBatch({ blockFrom, blockTo, publicKey, cachedEvents, withCache })
    const { decrypted, commitments: userCommitments } = decryptCommitmentEvents({
      publicKey,
      privateKey,
      commitmentEvents: commitments,
    })

    const decryptedHashes = decrypted.map((el) => encryptCrypto(JSON.stringify(el), el.commitment._hex, privateKey))

    port.postMessage({ result: { decrypted, commitments, userCommitments, decryptedHashes } })
  } catch (err) {
    port.postMessage({ errorMessage: err.message })
  }
}

const getEventsFromTxHash = async ({ txHash, publicKey, privateKey }, [port]) => {
  try {
    const lastEvents = await getEvents({
      key: txHash.toLowerCase(),
      indexName: 'transactionHash',
      storeName: 'commitment_events_100',
    })

    if (lastEvents && lastEvents.length) {
      const foundEvents = decryptCommitmentEvents({ publicKey, privateKey, commitmentEvents: lastEvents })
      port.postMessage({ result: foundEvents.decrypted })
      return
    }

    const { commitmentEvents } = await getCommitments({ withCache: true })

    const { decrypted } = decryptCommitmentEvents({ publicKey, privateKey, commitmentEvents })
    const foundEvents = decrypted.find((event) => event.transactionHash.toLowerCase() === txHash.toLowerCase())

    port.postMessage({ result: foundEvents })
  } catch (err) {
    port.postMessage({ errorMessage: err.message })
  }
}

const getLastSyncBlock = async () => {
  try {
    const [lastEvent] = await getEvents({
      indexName: 'name',
      key: 'commitment_events_100',
      storeName: 'last_sync_event',
    })
    return lastEvent ? lastEvent.blockNumber : numbers.DEPLOYED_BLOCK
  } catch (err) {
    console.error('getLastSyncBlock has error:', err.message)
    return numbers.DEPLOYED_BLOCK
  }
}

const getCashedEvents = async ({ storeName, publicKey, privateKey }, [port]) => {
  try {
    const isIdbEnable = await getIsDBEnabled()

    if (!isIdbEnable) {
      const cachedEvents = await self.$indexedDB.getAll({ storeName })
      const decrypted = []
      for (const cachedEvent of cachedEvents) {
        try {
          const event = decryptCrypto(cachedEvent.hash, privateKey)

          if (!decrypted.find((el) => el.index === event.index)) {
            decrypted.push(event)
          }
        } catch {
          continue
        }
      }
      const [lastEvent] = decrypted.sort((a, b) => b.blockNumber - a.blockNumber)
      port.postMessage({ result: { decrypted, lastSyncBlock: lastEvent ? lastEvent.blockNumber : numbers.DEPLOYED_BLOCK } })
      return
    }

    port.postMessage({ result: [] })
  } catch (err) {
    port.postMessage({ errorMessage: err.message })
  }
}

const getCashedCommitmentEvents = async ({ storeName, publicKey, privateKey }, [port]) => {
  try {
    const isIdbEnable = await getIsDBEnabled()

    if (!isIdbEnable) {
      const cachedEvents = await self.$indexedDB.getAll({ storeName })

      const commitments = cachedEvents.reduce((acc, curr) => {
        if (!acc.find((el) => el.index === curr.index)) {
          acc.push(curr)
        }
        return acc
      }, [])

      const [lastEvent] = commitments.sort((a, b) => b.blockNumber - a.blockNumber)

      port.postMessage({ result: { commitments, lastSyncBlock: lastEvent ? lastEvent.blockNumber : numbers.DEPLOYED_BLOCK } })
      return
    }

    port.postMessage({ result: [] })
  } catch (err) {
    port.postMessage({ errorMessage: err.message })
  }
}

const saveFreshEvents = ({ data, storeName }, [port]) => {
  try {
    saveEvents({ events: data, storeName })
    port.postMessage({ result: 'success' })
  } catch (err) {
    port.postMessage({ errorMessage: err.message })
  }
}

const saveLastSyncBlock = async ({ lastSyncBlock }, [port]) => {
  try {
    await self.$indexedDB.putItem({
      data: {
        blockNumber: lastSyncBlock,
        name: 'commitment_events_100',
      },
      storeName: 'last_sync_event',
    })
    port.postMessage({ result: 'success' })
  } catch (err) {
    port.postMessage({ errorMessage: err.message })
  }
}

const listener = ({ data, ports }) => {
  self.postMessage(data)
  switch (data.eventName) {
    case workerEvents.GET_COMMITMENT_EVENTS:
      getCommitmentEvents(data.payload, ports)
      break
    // new
    case workerEvents.INIT_WORKER:
      initWorker(data.payload)
      break
    case workerEvents.GET_BATCH_EVENTS:
      getBatchEvents(data.payload, ports)
      break
    case workerEvents.GET_BATCH_COMMITMENTS_EVENTS:
      getBatchCommitmentsEvents(data.payload, ports)
      break
    case workerEvents.GET_EVENTS_FROM_TX_HASH:
      getEventsFromTxHash(data.payload, ports)
      break
    case workerEvents.GET_CACHED_EVENTS:
      getCashedEvents(data.payload, ports)
      break
    case workerEvents.GET_CACHED_COMMITMENTS_EVENTS:
      getCashedCommitmentEvents(data.payload, ports)
      break
    case workerEvents.SAVE_EVENTS:
      saveFreshEvents(data.payload, ports)
      break
    case workerEvents.SAVE_LAST_SYNC_BLOCK:
      saveLastSyncBlock(data.payload, ports)
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

const poseidonHash = (items) => {
  return BigNumber.from(poseidon(items).toString())
}

const unpackEncryptedMessage = (encryptedMessage) => {
  if (encryptedMessage.slice(numbers.ZERO, numbers.TWO) === '0x') {
    encryptedMessage = encryptedMessage.slice(numbers.TWO)
  }

  const messageBuff = Buffer.from(encryptedMessage, 'hex')

  const nonceBuf = messageBuff.slice(numbers.ZERO, numbers.NONCE_BUF_LENGTH)
  const ciphertextBuf = messageBuff.slice(numbers.EPHEM_PUBLIC_KEY_BUF_LENGTH)
  const ephemPublicKeyBuf = messageBuff.slice(numbers.NONCE_BUF_LENGTH, numbers.EPHEM_PUBLIC_KEY_BUF_LENGTH)

  return {
    version: 'x25519-xsalsa20-poly1305',
    nonce: nonceBuf.toString('base64'),
    ciphertext: ciphertextBuf.toString('base64'),
    ephemPublicKey: ephemPublicKeyBuf.toString('base64'),
  }
}

const keyPairDecrypt = (data, privateKey) => {
  return Buffer.from(decrypt(unpackEncryptedMessage(data), privateKey.slice(numbers.TWO)), 'base64')
}

const keypairSign = (privateKey, commitment, merklePath) => {
  return poseidonHash([privateKey, commitment, merklePath])
}

const getNullifier = ({ amount, privateKey, publicKey, blinding, index }) => {
  // eslint-disable-next-line eqeqeq
  if (amount.gt(numbers.ZERO) && (index == undefined || privateKey == undefined)) {
    throw new Error('Can not compute nullifier without utxo index or shielded key')
  }

  const commitment = poseidonHash([amount, publicKey, blinding])
  const signature = privateKey ? keypairSign(privateKey, commitment, index || numbers.ZERO) : numbers.ZERO

  const nullifier = poseidonHash([commitment, index || numbers.ZERO, signature])

  return { commitment, nullifier }
}

const getHex = (data, from, to) => {
  return data.slice(from, to).toString('hex')
}

const encryptCrypto = (string, id, key) => {
  return { hash: AES.encrypt(string, key).toString(), id: HmacSHA256(id, key).toString() }
}

const decryptCrypto = (string, key) => {
  const bytes = AES.decrypt(string, key)
  const originalText = bytes.toString(enc.Utf8)

  return JSON.parse(originalText)
}
initDataBase()
self.addEventListener('message', listener, false)
