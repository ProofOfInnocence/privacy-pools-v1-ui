'use client'

import { WRAPPED_TOKEN } from '@/constants'
import { ChainId } from '@/types'
import React, { useState } from 'react'
import { useBalance } from 'wagmi'

const DepositComponent = ({ deposit, address }: { deposit: (amount: string) => void; address: string }) => {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState('0')
  const WETHbalance = useBalance({
    address: address as `0x${string}`,
    token: WRAPPED_TOKEN[ChainId.ETHEREUM_GOERLI] as `0x${string}`,
    watch: true,
    onSuccess(data) {
      setBalance(data.formatted)
    },
  })

  const handleMaxClick = () => {
    setAmount(balance)
  }

  const handleDepositClick = () => {
    deposit(amount)
    setAmount('') // Clearing the input after depositing
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Enter deposit amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button onClick={handleMaxClick} className="ml-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Max
        </button>
      </div>
      <button onClick={handleDepositClick} className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
        Deposit
      </button>
      <div className="mt-4">
        <p>Balance: {balance}</p>
      </div>
    </div>
  )
}

export default DepositComponent
