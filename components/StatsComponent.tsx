'use client'
import { useBalance } from 'wagmi'
import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
const ADDRESS = '0x952198215a9D99bE8CEFc791337B909bF520d98F'

function StatsComponent() {
  const [poolBalance, setPoolBalance] = useState<string | undefined>('0')
  const [txCount, setTxCount] = useState(0)

  const result = useBalance({
    address: ADDRESS,
  })
  const client = usePublicClient()

  useEffect(() => {
    setPoolBalance(result.data?.formatted)

    return () => {}
  }, [])

  useEffect(() => {
    client.getTransactionCount({ address: ADDRESS }).then((data) => setTxCount(data))
  }, [txCount])

  return (
    <div className="pb-4 pt-10 px-6 sm:px-10">
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-center text-black mb-8">
          <p className="text-5xl font-bold">{Number(poolBalance).toFixed(3)} ETH</p>
          <small className="text-base font-light mt-3">Total Value Locked</small>
        </div>
        <div className="flex flex-col items-center justify-center text-black">
          <p className="text-5xl font-bold">{txCount}</p>
          <small className="text-base font-light mt-3">Total Transaction Count</small>
        </div>
      </div>
    </div>
  )
}

export default StatsComponent
