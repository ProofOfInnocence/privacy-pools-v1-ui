'use client'

import React, { useState } from 'react'
import { useBalance } from 'wagmi'

interface WrapEtherProps {
  wrapEther: (amount: string) => void
  address: string
}

const WrapEtherComponent: React.FC<WrapEtherProps> = ({ wrapEther, address }) => {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState('0')
  const ETHbalance = useBalance({
    address: address as `0x${string}`,
    watch: true,
    onSuccess(data) {
      setBalance(data.formatted)
    },
  })

  const handleMaxClick = () => {
    setAmount(balance)
  }

  const handleWrapClick = () => {
    wrapEther(amount)
    setAmount('') // Clearing the input after wrapping
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Enter amount to wrap"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button onClick={handleMaxClick} className="ml-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Max
        </button>
      </div>
      <button onClick={handleWrapClick} className="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600">
        Wrap Ether
      </button>
      <div className="mt-4">
        <p>Balance: {balance}</p>
      </div>
    </div>
  )
}

export default WrapEtherComponent
