import { ArgsProof, ExtData, MembershipProof } from '@/services/core/@types';
import { RelayerInfo } from '@/types'
import axios from 'axios';

export async function sendToRelayer(
  relayer: RelayerInfo,
  { extData, args, membershipProof }: { extData: ExtData; args: ArgsProof; membershipProof: MembershipProof }
) {
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
  console.log("Send TO RELAYER: ", res)
  // const txStatus = await checkWithdrawal(relayer, res)
  return res
}