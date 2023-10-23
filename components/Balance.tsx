'use client'

// Balance.js
import React from 'react'
import { fromWei } from 'web3-utils'

const Balance = ({ shieldedBalance }: { shieldedBalance: number }) => (
  <div>
    <div className="text-gray-500 text-sm">Your shielded balance</div>
    <div className="text-lg font-semibold">{fromWei(shieldedBalance.toString())} ETH</div>
  </div>
)

export default Balance
