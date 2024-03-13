'use client'
import { useBalance } from 'wagmi'
import { useEffect, useState } from 'react'
import { WRAPPED_TOKEN } from '@/constants'
import { POOL_CONTRACT } from '@/constants'
import { ChainId } from '@/types'

function StatsComponent() {
  const [poolBalance, setPoolBalance] = useState('0')

  const WETHbalance = useBalance({
    address: POOL_CONTRACT[ChainId.ETHEREUM_SEPOLIA] as `0x${string}`,
    chainId: ChainId.ETHEREUM_SEPOLIA,
    watch: true,
    onSuccess(data) {
      const formattedNumber = parseFloat(data.formatted).toFixed(5)
      setPoolBalance(formattedNumber)
    },
  })

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const withdrawCount = await client.getTransactionCount({ address: ADDRESS_WITHDRAW })
  //     setWithdrawTxCount(withdrawCount)
  //   }
  //   fetchData()

  // }, [withdrawTxCount])

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const depositCount = await client.getTransactionCount({ address: ADDRESS_DEPOSIT })
  //     setDepositTxCount(depositCount)
  //   }
  //   fetchData()

  // }, [depositTxCount])

  return (
    <div className="pb-4 pt-10 px-6 sm:px-10">
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-center text-black mb-8">
          <p className="text-5xl font-bold">{Number(poolBalance).toFixed(3)} ETH</p>
          <small className="text-base font-light mt-3">Total Value Locked</small>
        </div>
        {/* <div className="flex flex-col items-center justify-center text-black">
          <p className="text-5xl font-bold">{depositTxCount + withdrawTxCount}</p>
          <small className="text-base font-light mt-3">Total Transaction Count</small>
        </div> */}
      </div>
    </div>
  )
}

export default StatsComponent
