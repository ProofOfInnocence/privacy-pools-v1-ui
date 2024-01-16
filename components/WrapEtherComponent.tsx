'use client'

import { useState } from 'react'
import { useBalance } from 'wagmi'

interface WrapEtherProps {
  wrapEther: (amount: string) => void
  address: string
}

function WrapEtherComponent({ wrapEther, address }: WrapEtherProps) {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState('0')
  const ETHbalance = useBalance({
    address: address as `0x${string}`,
    watch: true,
    onSuccess(data) {
      const formattedNumber = parseFloat(data.formatted).toFixed(3)
      setBalance(formattedNumber)
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
    <div className="pb-4 pt-8 px-10">
      <div className="relative flex items-center mb-6">
        <label className="absolute left-8 top-8 font-bold text-black text-opacity-40">You Wrap</label>
        <input
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 px-8 py-20 bg-[#F5F5F5] rounded-[40px] text-4xl w-full text-black text-opacity-70 placeholder:text-black placeholder:text-opacity-10"
        />
        <div className="flex absolute right-8 bottom-8 text-lg font-bold">
          <p className="relative text-black text-opacity-40">Balance: {balance} ETH</p>
          <button onClick={handleMaxClick} className="relative ml-2 pl-2 text-[#1A73E8] hover:text-opacity-70">
            Max
          </button>
        </div>
      </div>
      <button
        onClick={handleWrapClick}
        disabled={amount === '' || address === ''}
        className="px-4 py-3 text-lg text-white font-bold bg-[#1A73E8] rounded-[40px] hover:bg-[#1a73e8c4] hover:cursor-pointer disabled:text-black disabled:text-opacity-30 disabled:bg-[#F5F5F5] disabled:cursor-not-allowed w-full"
      >
        Wrap ETH
      </button>
    </div>
  )
}

export default WrapEtherComponent
