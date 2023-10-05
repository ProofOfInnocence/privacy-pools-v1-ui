const workerEvents = {
  INIT_WORKER: 'initWorker',
  GET_COMMITMENT_EVENTS: 'get_commitment_events',
  // nullifier
  GET_UNSPENT_EVENTS: 'get_unspent_events',
  GET_NULLIFIER_EVENT: 'get_nullifier_event',
  GET_NULLIFIER_EVENTS_FROM_TX_HASH: 'get_nullifier_events_from_tx_hash',
  UPDATE_NULLIFIER_EVENTS: 'update_nullifier_events',
  // events
  GET_BATCH_EVENTS: 'get_batch_events',
  GET_BATCH_COMMITMENTS_EVENTS: 'get_batch_commitments_events',
  GET_EVENTS_FROM_TX_HASH: 'get_events_from_tx_hash',
  SAVE_EVENTS: 'save_events',
  GET_CACHED_EVENTS: 'get_cached_events',
  GET_CACHED_COMMITMENTS_EVENTS: 'get_cached_commitments_events',
  SAVE_LAST_SYNC_BLOCK: 'save_last_sync_block',
}

const numbers = {
  ZERO: 0,
  TWO: 2,
  ONE: 1,
  BYTES_31: 31,
  BYTES_62: 62,
  IS_SPENT_INDEX: 1,
  OX_LENGTH: 2,
  RECALL_DELAY: 500,
  NULLIFIER_LENGTH: 66,
  NONCE_BUF_LENGTH: 24,
  COMMITMENTS_CHAIN: 100,
  DEPLOYED_BLOCK: 19097755,
  DECRYPT_WORKERS_COUNT: 8,
  MIN_BLOCKS_INTERVAL_LINE: 200000,
  EPHEM_PUBLIC_KEY_BUF_LENGTH: 56,
}

export { workerEvents, numbers }
