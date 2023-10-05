import { deleteDB, openDB } from 'idb'
import { OpenDBCallbacks, IDBPDatabase, DBSchema, StoreNames } from 'idb/build/esm/entry'

import {
  IDB,
  IDBOptions,
  GetAllParams,
  GetItemParams,
  AddItemParams,
  PutItemParams,
  GetItemResult,
  CreateTxParams,
  GetItemsResult,
  ClearStoreParams,
  GetFromIndexParams,
  CreateMultiTxParams,
  GetAllFromIndexParams,
} from './@types'

const VERSION_ERROR = 'less than the existing version'
const INDEX_DB_ERROR = 'A mutation operation was attempted on a database that did not allow mutations.'

const IDB_VERSION = 9

// TODO method for migration, remove indexed
class IndexedDB<S extends DBSchema> implements IDB<S> {
  public dbName: string
  public dbExists: boolean
  public isBlocked: boolean
  public db: IDBPDatabase<S>
  public options: OpenDBCallbacks<S>

  public constructor({ stores, dbName }: IDBOptions<S>) {
    this.dbExists = false
    this.isBlocked = false

    this.options = {
      upgrade(db: IDBPDatabase<S>) {
        Object.values(db.objectStoreNames).forEach((value) => {
          db.deleteObjectStore(value)
        })

        stores.forEach(({ name, keyPath, indexes }) => {
          const store = db.createObjectStore(name as StoreNames<S>, {
            keyPath,
            autoIncrement: true,
          })

          if (Array.isArray(indexes)) {
            indexes.forEach(({ name, unique = false }) => {
              store.createIndex(name, String(name), { unique })
            })
          }
        })
      },
    }

    this.dbName = dbName
  }

  public async initDB() {
    try {
      if (this.dbExists) {
        return
      }

      this.db = await openDB(this.dbName, IDB_VERSION, this.options) // version (optional): Schema version, or undefined to open the current version.
      this.onEventHandler()

      this.dbExists = true
    } catch (err) {
      // need for private mode firefox browser
      if (err.message.includes(INDEX_DB_ERROR)) {
        this.isBlocked = true
        return
      }

      if (err.message.includes(VERSION_ERROR)) {
        await this.removeExist()
      }

      console.error(`initDB has error: ${err.message}`)
    }
  }

  public async createTransactions<P>({ storeName, data, mode = 'readwrite' }: CreateTxParams<S, P>) {
    try {
      const tx = this.db.transaction(storeName, mode)
      const storedItem = tx.objectStore(storeName)

      if (storedItem.add) {
        await storedItem.add(data)
        await tx.done
      }
    } catch (err) {
      throw new Error(`Method createTransactions has error: ${err.message}`)
    }
  }

  public createMultipleTransactions<P extends object[]>({
    storeName,
    data,
    index,
    mode = 'readwrite',
  }: CreateMultiTxParams<S, P>) {
    try {
      const tx = this.db.transaction(storeName, mode)

      data.forEach((item) => {
        if (item && tx.store && tx.store.put) {
          tx.store.put({ ...item, ...index })
        }
      })
    } catch (err) {
      throw new Error(`Method createMultipleTransactions has error: ${err.message}`)
    }
  }

  public async getFromIndex(params: GetFromIndexParams<S>): Promise<GetItemsResult> {
    if (this.isBlocked) {
      return
    }

    try {
      const item = await this.getFromIndexHandler(params)
      return item
    } catch (err) {
      return undefined
    }
  }

  public async getItem({ storeName, key }: GetItemParams<S>): Promise<GetItemResult> {
    try {
      if (this.isBlocked) {
        return
      }

      const store = this.db.transaction(storeName).objectStore(storeName)

      const value = await store.get(key)
      return value
    } catch (err) {
      throw new Error(`Method getItem has error: ${err.message}`)
    }
  }

  public async addItem<P>({ storeName, data, key }: AddItemParams<S, P>) {
    try {
      const tx = this.db.transaction(storeName, 'readwrite')
      const isExist = await tx.objectStore(storeName).get(key)

      if (!isExist) {
        await tx.objectStore(storeName).add(data)
      }
    } catch (err) {
      throw new Error(`Method addItem has error: ${err.message}`)
    }
  }

  public async putItem<P>({ storeName, data }: PutItemParams<S, P>) {
    try {
      if (this.isBlocked) {
        return
      }

      const tx = this.db.transaction(storeName, 'readwrite')
      await tx.objectStore(storeName).put(data)
    } catch (err) {
      throw new Error(`Method putItem has error: ${err.message}`)
    }
  }

  public async getAll({ storeName }: GetAllParams<S>): Promise<GetItemsResult> {
    try {
      if (this.isBlocked || !this.dbExists) {
        return []
      }

      const tx = this.db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const data = await store.getAll()
      return data
    } catch (err) {
      throw new Error(`Method getAll has error: ${err.message}`)
    }
  }

  public async clearStore({ storeName, mode = 'readwrite' }: ClearStoreParams<S>) {
    try {
      const tx = this.db.transaction(storeName, mode)
      const storedItem = tx.objectStore(storeName)

      if (storedItem.clear) {
        await storedItem.clear()
      }
    } catch (err) {
      throw new Error(`Method clearStore has error: ${err.message}`)
    }
  }

  public async getAllFromIndex(params: GetAllFromIndexParams<S>): Promise<GetItemsResult> {
    if (this.isBlocked) {
      return []
    }

    try {
      const items = await this.getAllFromIndexHandler(params)
      return items
    } catch (err) {
      return []
    }
  }

  private onEventHandler() {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.db.addEventListener('onupgradeneeded', async () => {
      await this.removeExist()
    })
  }

  private async removeExist() {
    await deleteDB(this.dbName)
    this.dbExists = false

    await this.initDB()
  }

  private async getFromIndexHandler({ storeName, indexName, key }: GetFromIndexParams<S>) {
    try {
      const value = await this.db.getFromIndex(storeName, indexName, key)
      return value
    } catch (err) {
      throw new Error(`Method getFromIndexHandler has error: ${err.message}`)
    }
  }

  private async getAllFromIndexHandler({ storeName, indexName, key, count }: GetAllFromIndexParams<S>): GetItemsResult {
    try {
      const value = await this.db.getAllFromIndex(storeName, indexName, key, count)
      return value
    } catch (err) {
      throw new Error(`Method getAllFromIndex has error: ${err.message}`)
    }
  }
}

export { IndexedDB }
