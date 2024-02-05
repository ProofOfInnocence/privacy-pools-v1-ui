'use client'

// Balance.js
import { fromWei } from 'web3-utils'

function Balance({ shieldedBalance }: { shieldedBalance: number }) {
  console.log('shieldedBalance', shieldedBalance)
  return (
    <div>
      <div className="text-gray-500 text-sm">Your shielded balance</div>
      <div className="text-lg font-semibold">{fromWei(shieldedBalance.toString())} ETH</div>
    </div>
  )
}

export default Balance
