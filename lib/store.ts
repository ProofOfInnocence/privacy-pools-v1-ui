import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import accountReducer from './features/accountSlice'
import walletReducer from './features/walletSlice'
import relayerReducer from './features/relayerSlice'
import transactionReducer from './features/transactionSlice'

export const makeStore = () => {
    return configureStore({
        reducer: { account: accountReducer, wallet: walletReducer, relayer: relayerReducer, transaction: transactionReducer },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['account/getUtxoFromKeypair/fulfilled']
            }
        })
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']