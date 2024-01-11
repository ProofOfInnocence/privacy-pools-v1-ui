'use client'

import { WRAPPED_TOKEN } from '@/constants'
import { ChainId } from '@/types'
import { useState } from 'react'
import { useBalance } from 'wagmi'

interface DepositProps {
  deposit: (amount: string) => void
  address: string
}

function DepositComponent({ deposit, address }: DepositProps) {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState('0')

  const WETHbalance = useBalance({
    address: address as `0x${string}`,
    token: WRAPPED_TOKEN[ChainId.ETHEREUM_GOERLI] as `0x${string}`,
    watch: true,
    onSuccess(data) {
      const formattedNumber = parseFloat(data.formatted).toFixed(3)
      setBalance(formattedNumber)
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
    <div className="pb-4 pt-10 px-10">
      <div className="relative flex items-center mb-6">
        <label className="absolute left-8 top-8 font-bold text-black text-opacity-40">You Deposit</label>
        <input
          type="number"
          placeholder="0"
          value={amount}
          min={0}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 px-8 py-20 bg-[#F5F5F5] rounded-[40px] text-5xl w-full text-black placeholder:text-black placeholder:text-opacity-10 transition-all duration-150 hover:bg-[#eaeaea]"
        />
        <div className="flex justify-between absolute right-0 left-0 bottom-8 text-lg font-bold">
          <p className="relative left-8 text-black text-opacity-40">${amount === '' || amount === undefined ? '0' : amount}</p>
          <div className="flex relative right-8">
            <p className="text-black text-opacity-40">Balance: {balance} ETH</p>
            <button onClick={handleMaxClick} className="ml-2 pl-2 text-[#1A73E8] hover:text-opacity-70">
              Max
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={handleDepositClick}
        disabled={amount === '' || address === ''}
        className="px-4 py-3 text-lg text-white font-bold bg-[#1A73E8] rounded-[40px] hover:bg-[#1a73e8c4] hover:cursor-pointer disabled:text-black disabled:text-opacity-30 disabled:bg-[#F5F5F5] disabled:cursor-not-allowed w-full"
      >
        Deposit
      </button>
    </div>
  )
}

export default DepositComponent
