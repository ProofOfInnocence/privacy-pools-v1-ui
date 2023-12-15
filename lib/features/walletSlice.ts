import { WalletState } from "@/types/wallet";
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APPROVAL_MESSAGE, POOL_CONTRACT } from '@/constants'
import { ArgsProof, ExtData } from '@/services/core/@types'
import { ChainId, LogLevel } from '@/types'
import { toHexString, toWei } from '@/utilities'
import { WalletClient, PublicClient } from 'viem'
import { PrivacyPool__factory as TornadoPool__factory, WETH__factory } from '@/_contracts'
import { getWrappedToken } from '@/contracts'
import { BigNumber } from 'ethers'

export async function signStartMessage() { }

export const transactThunk = createAsyncThunk("wallet/transact", async ({
    walletClient,
    publicClient,
    logger,
    syncPoolBalance,
    args,
    extData
}: {
    walletClient: WalletClient
    publicClient: PublicClient
    logger: (message: string, logLevel: LogLevel) => void
    syncPoolBalance: () => Promise<void>
    args: ArgsProof
    extData: ExtData
}) => {
    if (!walletClient) {
        throw new Error('Wallet client is null')
    }
    if (!publicClient) {
        throw new Error('Public client is null')
    }

    const [address] = await walletClient.getAddresses()
    const { request } = await publicClient.simulateContract({
        address: toHexString(POOL_CONTRACT[ChainId.ETHEREUM_GOERLI]),
        abi: TornadoPool__factory.abi,
        functionName: 'transact',
        args: [args, extData],
        account: address,
    })
    logger('Confirm transaction in your wallet', LogLevel.LOADING)
    const hash = await walletClient.writeContract(request)
    logger('Waiting for transaction ' + hash, LogLevel.LOADING)
    await publicClient.waitForTransactionReceipt({ hash })
    await syncPoolBalance()
})

export const handleAllowanceThunk = createAsyncThunk("wallet/handleAllowance", async ({
    walletClient,
    publicClient,
    logger,
    amount
}: {
    walletClient: WalletClient
    publicClient: PublicClient
    logger: (message: string, logLevel: LogLevel) => void
    amount: string
}) => {
    // const amountInWei = toWei(amount)
    const weth = getWrappedToken(ChainId.ETHEREUM_GOERLI)
    const [address] = await walletClient.getAddresses()
    // const wrappedAmount = await weth.balanceOf(address)
    // console.log('Wrapped amount', wrappedAmount.toString())
    // if (wrappedAmount.lt(amountInWei)) {
    //   const rem = BigNumber.from(amountInWei).sub(wrappedAmount)
    //   const { request } = await publicClient.simulateContract({
    //     address: toHexString(weth.address),
    //     abi: WETH__factory.abi,
    //     functionName: 'deposit',
    //     args: [],
    //     account: address,
    //     value: rem.toBigInt(),
    //   })
    //   const hash = await walletClient.writeContract(request)
    //   logger('Waiting for transaction ' + hash, LogLevel.LOADING)
    //   await publicClient.waitForTransactionReceipt({ hash })
    // }
    const curAllowance = await weth.allowance(address, POOL_CONTRACT[ChainId.ETHEREUM_GOERLI])

    if (curAllowance.lt(toWei(amount))) {
        const { request } = await publicClient.simulateContract({
            address: toHexString(weth.address),
            abi: WETH__factory.abi,
            functionName: 'approve',
            args: [POOL_CONTRACT[ChainId.ETHEREUM_GOERLI], 115792089237316195423570985008687907853269984665640564039457.584007913129639935],
            account: address,
        })
        logger(APPROVAL_MESSAGE, LogLevel.LOADING)
        const hash = await walletClient.writeContract(request)
        logger('Waiting for transaction ' + hash, LogLevel.LOADING)
        await publicClient.waitForTransactionReceipt({ hash })
    }
})



export const handleWrapEtherThunk = createAsyncThunk("wallet/handleWrapEther", async ({
    walletClient,
    publicClient,
    logger,
    amount
}: {
    walletClient: WalletClient
    publicClient: PublicClient
    logger: (message: string, logLevel: LogLevel) => void
    amount: string
}) => {
    const weth = getWrappedToken(ChainId.ETHEREUM_GOERLI)
    const [address] = await walletClient.getAddresses()

    const { request } = await publicClient.simulateContract({
        address: toHexString(weth.address),
        abi: WETH__factory.abi,
        functionName: 'deposit',
        args: [],
        account: address,
        value: toWei(amount).toBigInt(),
    })
    logger('Confirm transaction in your wallet', LogLevel.LOADING)
    const hash = await walletClient.writeContract(request)
    logger('Waiting for transaction ' + hash, LogLevel.LOADING)
    await publicClient.waitForTransactionReceipt({ hash })
})


const initialState: WalletState = {
    provider: {
        name: '',
        network: 123,
        chainId: 123,
        isConnected: false,
        mismatchNetwork: false,
    },
    account: {
        ensName: '',
        address: '',
        balance: '0',
    },
}


// Create a slice with reducers and the async thunk
const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setAccountBalance: (state, action: PayloadAction<string>) => {
            state.account.balance = action.payload
        }
    }
});

// Export actions and reducer
export const { setAccountBalance } = walletSlice.actions;
export default walletSlice.reducer;
