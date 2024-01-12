'use client'

import { useEffect, useState } from 'react'
import { LogLevel, RelayerInfo } from '@/types'
import { BigNumber } from 'ethers'
import { fromWei, shortenAddress, toWei } from '@/utilities'
import { TOKEN_SYMBOL } from '@/constants'
import Image from 'next/image'
import selectArrowIcon from 'public/images/select-arrow.svg'

type WithdrawComponentProps = {
  withdrawWithRelayer: (amount: string, fee: string, recipient: string, relayer: RelayerInfo) => void
  relayers: RelayerInfo[]
  logger: (message: string, logLevel: LogLevel) => void
  shieldedBalance: number
}

function WithdrawComponent({ withdrawWithRelayer, relayers, logger, shieldedBalance }: WithdrawComponentProps) {
  const [amount, setAmount] = useState<string | undefined>(undefined)
  const [recipient, setRecipient] = useState<string | undefined>(undefined)
  const [selectedRelayer, setSelectedRelayer] = useState(relayers[0])
  const [balance, setBalance] = useState('0.0000')
  // use state for fee with string or undefined
  const [fee, setFee] = useState<string | undefined>(undefined)

  const handleMaxClick = () => {
    setAmount(parseFloat(fromWei(shieldedBalance.toString())).toFixed(4))
  }

  const handleWithdrawClick = () => {
    if (!fee) {
      logger('Fee is undefined', LogLevel.ERROR)
      return
    }
    if (!recipient) {
      logger('Recipient is undefined', LogLevel.ERROR)
      return
    }
    if (!amount) {
      logger('Amount is undefined', LogLevel.ERROR)
      return
    }
    withdrawWithRelayer(amount, fee, recipient, selectedRelayer)
  }

  const calculateFee = async () => {
    console.log('selectedRelayer:', selectedRelayer)
    console.log('selectedRelayer.fee:', selectedRelayer.fee)
    const serviceFee = BigNumber.from(selectedRelayer.fee)
    console.log('serviceFee:', serviceFee)
    // const { fast } = await getGasPriceFromRpc(ChainId.ETHEREUM_GOERLI)
    const fast = 20
    console.log('fast:', fast)
    const gasLimit = BigNumber.from(2000000)
    const operationFee = BigNumber.from(fast).mul(gasLimit)
    console.log('gasLimit:', gasLimit)
    console.log('operationFee:', operationFee)
    // const feePercent = this.getServiceFee(externalAmount);
    // console.log('feePercent:', feePercent);
    // const expense = operationFee.div(toWei('1'))
    // console.log('expense:', expense)
    const desiredFee = operationFee.add(serviceFee)
    return desiredFee
  }

  useEffect(() => {
    // Define the async function to fetch and set the fee.
    const fetchFee = async () => {
      try {
        const desiredFee = await calculateFee()
        setFee(desiredFee.toString())
      } catch (error) {
        logger(error.message, LogLevel.ERROR)
      }
    }

    // Call the fetchFee function immediately on component mount.
    fetchFee()

    // Then set up the interval to call fetchFee every 15 seconds.
    const intervalId = setInterval(fetchFee, 15000)

    // Clear the interval on component unmount.
    return () => {
      clearInterval(intervalId)
    }
  }, [selectedRelayer])

  return (
    <div className="pb-4 pt-10 px-6 sm:px-10">
      <div className="relative flex items-center mb-8">
        <label className="absolute left-8 top-8 font-bold text-black text-opacity-40">You Withdraw</label>
        <input
          type="text"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          className="flex-1 px-8 py-20 bg-[#F5F5F5] rounded-[40px] text-5xl w-full text-black placeholder:text-black placeholder:text-opacity-10 transition-all duration-150 hover:bg-[#eaeaea]"
        />
        <div className="flex justify-between absolute right-0 left-0 bottom-8 text-lg font-bold">
          <p className="relative left-8 text-black text-opacity-40">${amount === '' || amount === undefined ? '0' : amount}</p>
          <div className="flex relative right-8">
            <p className="text-black text-opacity-40">Balance: {parseFloat(fromWei(shieldedBalance.toString())).toFixed(4)} ETH</p>
            <button onClick={handleMaxClick} className="ml-2 pl-2 text-[#1A73E8] hover:text-opacity-70">
              Max
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block mb-8 ml-6 text-lg font-bold">Recipient Address:</label>
        <input
          type="text"
          placeholder="Enter recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full px-8 py-4 font-bold text-xl rounded-[40px] bg-[#F5F5F5] text-black placeholder:text-black placeholder:text-opacity-30 transition-all duration-150 hover:bg-[#eaeaea]"
        />
      </div>
      <div className="mb-8">
        <label className="block mb-8 ml-6 text-lg font-bold">Select Relayer:</label>
        <div className="flex justify-start items-center">
          <span className="absolute ml-6 block w-4 h-4 bg-[#89FF7D] rounded-full"></span>
          <select
            value={selectedRelayer.api}
            onChange={(e) => setSelectedRelayer(relayers.find((r) => r.api === e.target.value) || relayers[0])}
            className="w-full pr-8 pl-12 py-4 font-bold text-xl rounded-[40px] bg-[#F5F5F5] text-black transition-all duration-150 hover:bg-[#eaeaea] hover:cursor-pointer box-border appearance-none"
          >
            {relayers.map((relayer) => (
              <option key={relayer.api} value={relayer.api}>
                {relayer.name}
              </option>
            ))}
          </select>
          <Image className="ml-[-2.5rem]" src={selectArrowIcon} alt="arrow icon" width={16} height={9} />
        </div>
      </div>

      {!fee && <p>Calculating fee...</p>}
      {fee && (
        <>
          <p className="mb-8 ml-6 text-lg font-bold">
            Withdrawal Fee: <span className="text-black text-opacity-40">{fromWei(fee)}</span>
          </p>
          {recipient && amount && (
            <p>
              Address {shortenAddress(recipient)} will get {fromWei(toWei(amount).sub(BigNumber.from(fee)))} {TOKEN_SYMBOL}
            </p>
          )}

          <button
            onClick={handleWithdrawClick}
            disabled={amount === '' || amount === undefined || recipient === '' || recipient === undefined}
            className="px-4 py-3 text-lg text-white font-bold bg-[#1A73E8] rounded-[40px] hover:bg-[#1a73e8c4] hover:cursor-pointer disabled:text-black disabled:text-opacity-30 disabled:bg-[#F5F5F5] disabled:cursor-not-allowed w-full"
          >
            Withdraw
          </button>
        </>
      )}
    </div>
  )
}

export default WithdrawComponent
