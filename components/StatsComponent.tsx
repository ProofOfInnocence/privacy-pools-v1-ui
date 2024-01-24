'use client'
import { useBalance } from 'wagmi'
import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
const ADDRESS_WITHDRAW = '0x952198215a9D99bE8CEFc791337B909bF520d98F'
const ADDRESS_DEPOSIT = "0x49Bf92Fa466854637aE5a4cD00E97DDEA43C0767"

function StatsComponent() {
  const [poolBalance, setPoolBalance] = useState<string | undefined>('0')
  const [withdrawTxCount, setWithdrawTxCount] = useState(0)
  const [depositTxCount, setDepositTxCount] = useState(0)

  const client = usePublicClient()

  const result = useBalance({
    address: ADDRESS_WITHDRAW,
  })
  

  useEffect(() => {
    setPoolBalance(result.data?.formatted)

    return () => {}
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const withdrawCount = await client.getTransactionCount({ address: ADDRESS_WITHDRAW })
      setWithdrawTxCount(withdrawCount)
    }
    fetchData()
    
  }, [withdrawTxCount])

  useEffect(() => {
    const fetchData = async () => {
      const depositCount = await client.getTransactionCount({ address: ADDRESS_DEPOSIT })
      setDepositTxCount(depositCount)
    }
    fetchData()
    
  }, [depositTxCount])
 

  console.log("total", depositTxCount + withdrawTxCount);
  console.log("deposit", depositTxCount);
  console.log("withdraw", withdrawTxCount);
  

  return (
    <div className="pb-4 pt-10 px-6 sm:px-10">
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-center text-black mb-8">
          <p className="text-5xl font-bold">{Number(poolBalance).toFixed(3)} ETH</p>
          <small className="text-base font-light mt-3">Total Value Locked</small>
        </div>
        <div className="flex flex-col items-center justify-center text-black">
          <p className="text-5xl font-bold">{depositTxCount + withdrawTxCount}</p>
          <small className="text-base font-light mt-3">Total Transaction Count</small>
        </div>
      </div>
    </div>
  )
}

export default StatsComponent
