import { OpenDBCallbacks, IDBPDatabase, StoreValue, StoreNames, IndexNames } from 'idb/build/esm/entry'

export enum IndexDBStores {
  COMMITMENT_EVENTS = 'commitment_events',
  NULLIFIER_EVENTS = 'nullifier_events',
  ACCOUNT_EVENTS = 'account_events',
  LAST_EVENTS = 'last_events',
  REGISTER_EVENTS = 'register_events',
}

export enum KeyPaths {
  INDEX = 'index',
  KEY = 'key',
  NAME = 'name',
}

export type CreateTxParams<S, P> = {
  data: P
  storeName: StoreNames<S>
  mode: IDBTransactionMode
}

export type CreateMultiTxParams<S, P> = {
  index?: IDBIndex<S>
} & CreateTxParams<S, P>

export type GetFromIndexParams<S> = {
  key: IDBKeyRange
  storeName: StoreNames<S>
  indexName: IndexNames<S, StoreNames<S>>
}

export type GetAllFromIndexParams<S> = {
  count?: number
} & GetFromIndexParams<S>

export type AddItemParams<S, P> = {
  data: P
  key: string
  storeName: StoreNames<S>
}

export type PutItemParams<S, P> = {
  data: P
  storeName: StoreNames<S>
}

export type GetItemParams<S> = {
  key: string
  storeName: StoreNames<S>
}

export type GetAllParams<S> = {
  storeName: StoreNames<S>
}

export type ClearStoreParams<S> = {
  storeName: StoreNames<S>
  mode: IDBTransactionMode
}

export type IDBIndex<S> = {
  unique: boolean
  name: IndexNames<S, StoreNames<S>>
}

export type IDBStore<S> = {
  keyPath: KeyPaths
  name: StoreNames<unknown>
  indexes?: Array<IDBIndex<S>>
}

export type GetItemResult = StoreValue<unknown, string>
export type GetItemsResult = Promise<GetItemResult[] | undefined>

export type IDBOptions<S> = {
  dbName: string
  stores: Array<IDBStore<S>>
}

export interface IDB<S> {
  dbName: string
  dbExists: boolean
  isBlocked: boolean
  initDB: () => void
  db: IDBPDatabase<S>
  options: OpenDBCallbacks<S>
  addItem: <P>(params: AddItemParams<S, P>) => void
  putItem: <P>(params: PutItemParams<S, P>) => void
  clearStore: (params: ClearStoreParams<S>) => void
  getAll: (params: GetAllParams<S>) => Promise<GetItemsResult>
  createTransactions: <P>(params: CreateTxParams<S, P>) => void
  getItem: (params: GetItemParams<S>) => Promise<GetItemResult>
  getFromIndex: (params: GetFromIndexParams<S>) => Promise<GetItemsResult>
  getAllFromIndex: (params: GetAllFromIndexParams<S>) => Promise<GetItemsResult>
  createMultipleTransactions: <P extends object[]>(params: CreateMultiTxParams<S, P>) => void
}
