'use client'

import { ETH_MAIN_TOKEN, WRAPPED_TOKEN, ETH_PRICE_URL } from '@/constants'
import { ChainId } from '@/types'
import { ChangeEvent, useEffect, useState } from 'react'
import { useBalance } from 'wagmi'
import { formatNumber } from '@/utilities/formatNumber'
import axios from 'axios'

interface DepositProps {
  deposit: (amount: string) => void
  address: string
}

function DepositComponent({ deposit, address }: DepositProps) {
  const [amount, setAmount] = useState('')
  const [calculatedPrice, setCalculatedPrice] = useState('')
  const [balance, setBalance] = useState('0')
  const [ethPrice, setEthPrice] = useState('0')

  const ETHbalance = useBalance({
    address: address as `0x${string}`,
    chainId: ChainId.ETHEREUM_SEPOLIA,
    watch: true,
    onSuccess(data) {
      const formattedNumber = parseFloat(data.formatted).toFixed(5)
      setBalance(formattedNumber)
    },
  })

  useEffect(() => {
    fetchETHPrice()
  }, [])

  const fetchETHPrice = async () => {
    try {
      const response = await axios.get(ETH_PRICE_URL)
      const fetchedEthPrice = response.data.USD
      setEthPrice(fetchedEthPrice)
    } catch (error) {
      console.error('Error fetching ETH prices:', error)
    }
  }

  const calculatePrice = (inputAmount: string) => {
    let calculated = (parseFloat(inputAmount) * parseFloat(ethPrice)).toString()
    calculated = formatNumber(calculated)
    setCalculatedPrice(calculated)
  }

  const handleMaxClick = () => {
    setAmount(balance.toString())
    calculatePrice(balance)
  }

  const handleInputUpdate = async (e: ChangeEvent<HTMLInputElement>) => {
    const inputAmount = e.target.value
    setAmount(inputAmount)

    try {
      const response = await axios.get(ETH_PRICE_URL)
      const fetchedEthPrice = response.data.USD
      setEthPrice(fetchedEthPrice)
      calculatePrice(inputAmount)
    } catch (error) {
      console.error('Error fetching ETH prices:', error)
    }
  }

  const handleDepositClick = () => {
    deposit(amount)
    setAmount('') // Clearing the input after depositing
  }

  return (
    <div className="pb-4 pt-10 px-6 sm:px-10">
      <div className="relative flex items-center mb-6">
        <label className="absolute left-8 top-8 font-bold text-black text-opacity-40">You Deposit</label>
        <input
          type="text"
          placeholder="0"
          value={amount}
          min={0}
          onChange={(e) => handleInputUpdate(e)}
          className="flex-1 px-8 py-20 bg-[#F5F5F5] rounded-[40px] text-5xl w-full text-black placeholder:text-black placeholder:text-opacity-10 transition-all duration-150 hover:bg-[#eaeaea]"
        />
        <div className="flex justify-end absolute right-0 left-0 bottom-8 text-lg font-bold">
          {/* <p className="relative left-8 text-black text-opacity-40">
            {amount === '' || amount === undefined || Number.isNaN(amount) ? '$0.0000' : `$${calculatedPrice}`}
          </p> */}
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
