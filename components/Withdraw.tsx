'use client'

import React, { useEffect, useState } from 'react'
import { ChainId, LogLevel, RelayerInfo } from '@/types'
import { getGasPriceFromRpc } from '@/services/gasOracle'
import { BigNumber } from 'ethers'
import { fromWei, shortenAddress, toWei } from '@/utilities'
import { TOKEN_SYMBOL } from '@/constants'

type WithdrawComponentProps = {
  withdrawWithRelayer: (amount: string, fee: string, recipient: string, relayer: RelayerInfo) => void
  relayers: RelayerInfo[]
  logger: (message: string, logLevel: LogLevel) => void
}

const WithdrawComponent: React.FC<WithdrawComponentProps> = ({ withdrawWithRelayer, relayers, logger }) => {
  const [amount, setAmount] = useState('0.0001')
  const [recipient, setRecipient] = useState('0xcbef1A6b6a001eEe4B75d99cf484DCe5D00F8925')
  const [selectedRelayer, setSelectedRelayer] = useState(relayers[0])
  // use state for fee with string or undefined
  const [fee, setFee] = useState<string | undefined>(undefined)

  const handleWithdrawClick = () => {
    if(!fee) {
      logger('Fee is undefined', LogLevel.ERROR)
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
    const fast = 20;
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
    const intervalId = setInterval(async () => {
      try {
        const desiredFee = await calculateFee()
        setFee(desiredFee.toString())
      } catch (error) {
        logger(error.message, LogLevel.ERROR)
      }
    }, 15000) // every 15 seconds

    return () => {
      clearInterval(intervalId)
    }
  }, [selectedRelayer])

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block mb-2">Withdraw Amount</label>
        <input
          type="text"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Recipient Address</label>
        <input
          type="text"
          placeholder="Enter recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Select Relayer</label>
        <select
          value={selectedRelayer.api}
          onChange={(e) => setSelectedRelayer(relayers.find((r) => r.api === e.target.value) || relayers[0])}
          className="w-full p-2 border rounded"
        >
          {relayers.map((relayer) => (
            <option key={relayer.api} value={relayer.api}>
              {relayer.name} | {relayer.api}
            </option>
          ))}
        </select>
      </div>

      {!fee && <p>Calculating fee...</p>}
      {fee && (
        <>
          <p>Fee: {fromWei(fee)}</p>
          <p>
            Address {shortenAddress(recipient)} will get {fromWei(toWei(amount).sub(BigNumber.from(fee)))} {TOKEN_SYMBOL}
          </p>

          <button onClick={handleWithdrawClick} className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
            Withdraw
          </button>
        </>
      )}
    </div>
  )
}

export default WithdrawComponent
