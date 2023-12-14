import { numbers } from '@/constants';
import { ArgsProof, ExtData, MembershipProof } from '@/services/core/@types';
import { RelayerInfo } from '@/types'
import { RelayerState } from '@/types/relayer';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const sendToRelayerThunk = createAsyncThunk("relayer/sendToRelayer", async ({
    relayer,
    extData, args, membershipProof
}: { relayer: RelayerInfo, extData: ExtData; args: ArgsProof; membershipProof: MembershipProof }) => {
    const { data: res } = await axios.post(
        `${relayer.api}/transaction`,
        {
            args,
            extData,
            membershipProof
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
    console.log(res)
})

const initialState: RelayerState = {

    ethRate: '1',
    loaders: {
        relayersFetching: false,
    },
    relayers: {
        list: [],
        selected: {
            name: '',
            ensName: '',
            url: '',
            chainId: numbers.ONE_HUNDRED,
            version: '',
            rewardAddress: '',
            type: '',
            health: {
                status: false,
                error: '',
            },
            serviceFee: {
                transfer: '',
                withdrawal: numbers.ZERO,
            },
        },
    },
    jobs: {
        activeJob: null,
    },

}


// Create a slice with reducers and the async thunk
const relayerSlice = createSlice({
    name: 'relayer',
    initialState,
    reducers: {}
});

// Export actions and reducer
export default relayerSlice.reducer;
