import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { registerStatuses, transferMethods } from '@/constants';
import { Keypair, Utxo, utxoFactory, createTransactionData } from "@/services"
import { ChainId } from "@/types"
import { toChecksumAddress } from "@/utilities"
import { AccountState } from '@/types/account';
import { UnspentUtxoData } from '@/services/utxoService/@types';
import { BG_ZERO } from "@/constants"
import { BigNumber } from "ethers"
import { createTransactionDataThunk } from './transactionSlice';



// Create an async thunk for fetching UTXO
export const getUtxoFromKeypairThunk = createAsyncThunk(
    'account/getUtxoFromKeypair',
    async ({
        keypair,
        accountAddress,
        withCache = false,
    }: {
        keypair: Keypair
        accountAddress: string
        withCache: boolean
    }, { rejectWithValue }) => {

        try {
            const utxoService = utxoFactory.getService(ChainId.ETHEREUM_GOERLI, accountAddress)
            const { totalAmount, unspentUtxo, freshUnspentUtxo, freshDecryptedEvents } = await utxoService.fetchUnspentUtxo({
                keypair,
                withCache,
                accountAddress: accountAddress,
                callbacks: {
                    // change address state
                    update: (payload: UnspentUtxoData) => {
                        console.log(payload.accountAddress)
                        if (payload.accountAddress === accountAddress) {
                            console.log('Update account balance', payload.totalAmount.toString())
                        }
                    },
                    set: (payload: UnspentUtxoData) => {
                        console.log(payload.accountAddress)
                        if (payload.accountAddress === accountAddress) {
                            console.log('Set account balance', payload.totalAmount.toString())
                        }
                    },
                },
            })

            if (freshUnspentUtxo.length) {
                console.log('Check unspent utxo')
                console.log(freshUnspentUtxo)
                console.log(freshDecryptedEvents)
                // dispatch('checkUnspentUtxo', { unspentUtxo: freshUnspentUtxo, decryptedEvents: freshDecryptedEvents })
            }


            return { unspentUtxo, totalAmount }
        } catch (err) {
            return rejectWithValue(err)
        }
    }
);

export const prepareTransactionThunk = createAsyncThunk("account/prepareTransaction", async ({
    keypair,
    amount,
    address,
    fee = BG_ZERO,
    relayer = BG_ZERO,
    recipient = BG_ZERO,
}: {
    keypair: Keypair
    amount: BigNumber
    address: string
    fee?: BigNumber
    relayer?: string | BigNumber
    recipient?: string | BigNumber
}, { dispatch, rejectWithValue }) => {
    try {
        const amountWithFee = amount.add(fee)
        const { unspentUtxo, totalAmount } = await dispatch(getUtxoFromKeypairThunk({ keypair: keypair, accountAddress: address, withCache: true })).unwrap()


        console.log('Total amount:', totalAmount.toString())

        let outputAmount
        if (recipient == BG_ZERO) {
            outputAmount = totalAmount.add(amountWithFee)
        } else {
            if (totalAmount.lt(amountWithFee)) {
                throw new Error('Not enough funds')
            }
            outputAmount = totalAmount.sub(amountWithFee)
        }

        if (unspentUtxo.length > 2) {
            throw new Error('Too many inputs')
        }
        const outputs = [new Utxo({ amount: outputAmount, keypair })]

        const { extData, args, membershipProof } = await dispatch(createTransactionDataThunk({
            params: {
                outputs,
                inputs: unspentUtxo.length > 2 ? unspentUtxo.slice(0, 2) : unspentUtxo,
                recipient: recipient !== BG_ZERO ? toChecksumAddress(recipient) : undefined,
                relayer: relayer !== BG_ZERO ? toChecksumAddress(relayer) : undefined,
                fee: fee,
            }, keypair
        })).unwrap()

        // const { extData, args, membershipProof } = await createTransactionData(
        //     {
        //         outputs,
        //         inputs: unspentUtxo.length > 2 ? unspentUtxo.slice(0, 2) : unspentUtxo,
        //         recipient: recipient !== BG_ZERO ? toChecksumAddress(recipient) : undefined,
        //         relayer: relayer !== BG_ZERO ? toChecksumAddress(relayer) : undefined,
        //         fee: fee,
        //     },
        //     keypair
        // )

        return { extData, args, membershipProof }
    } catch (err) {
        return rejectWithValue(err)
    }
})


const initialState: AccountState = {
    ensName: '',
    address: '',
    balance: '0',
    isBalanceFetching: false,
    registeredInPoolStatus: registerStatuses.NOT_CHECKED,
    settings: {
        shouldShowRiskAlert: true,
        shouldShowEthLinkAlert: true,
        shouldShowConfirmModal: true,
        shouldShowPrivacyAlert: true,
        shouldShowPoolTransferAlert: true,
        transferMethod: transferMethods.RELAYER,
    },
}


// Create a slice with reducers and the async thunk
const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        // setAccountAddress: (state, action: PayloadAction<string>) => {
        //     state.address = action.payload
        // },
        // setAccountBalance: (state, action: PayloadAction<string>) => {
        //     state.balance = action.payload
        // }
    },
    extraReducers: (builder) => {
        builder.addCase(getUtxoFromKeypairThunk.fulfilled, (state, action) => {
            state.balance = action.payload.totalAmount.toString()
            state.address = action.meta.arg.accountAddress.toString()
        })
        builder.addCase(getUtxoFromKeypairThunk.rejected, (state, action) => {
            throw new Error(`Method getUtxoFromKeypair has error: ${action.payload}`)
        })
        builder.addCase(prepareTransactionThunk.rejected, (state, action) => {
            throw new Error(`Method getUtxoFromKeypair has error: ${action.payload}`)
        })
    }
});

// Export actions and reducer
// export const { setAccountBalance } = accountSlice.actions
export default accountSlice.reducer;
