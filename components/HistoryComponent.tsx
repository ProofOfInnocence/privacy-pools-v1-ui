'use client'
import React, { useEffect, useState } from 'react'
import { workerProvider } from '@/services'
import { BigNumber } from 'ethers'
import { CHAINS, FIELD_SIZE } from '@/constants'
import { fromWei } from 'web3-utils'
import { ChainId } from '@/types'
import { TxRecordEvents } from '@/services/events/@types'

interface PubAmount {
  pubAmount: string
  value: number
  txHash: string
}

function HistoryComponent() {
  const [txRecords, setTxRecords] = useState<PubAmount[]>([])
  const [txRecordEvents, setTxRecordEvents] = useState<TxRecordEvents>([])

  useEffect(() => {
    const fetchTxRecordsEvents = async () => {
      const txRecordEvents = await workerProvider.getTxRecordEvents()
      setTxRecordEvents(txRecordEvents)
    }
    fetchTxRecordsEvents()
    fetchPoiSteps()
  }, [txRecordEvents])

  const fetchPoiSteps = () => {
    const pubAmountList: PubAmount[] = []
    txRecordEvents.forEach((record) => {
      const pubAmountWei = BigNumber.from(record.publicAmount).toString()
      if (BigInt(Number(FIELD_SIZE)) - BigInt(pubAmountWei) > Number(FIELD_SIZE) / 2) {
        const pubAmountEth = fromWei(pubAmountWei)
        pubAmountList.push({ pubAmount: pubAmountEth, value: 1, txHash: record.transactionHash })
      } else {
        const calculated = (BigInt(FIELD_SIZE.toString()) - BigInt(pubAmountWei)).toString()
        const calculatedEth = fromWei(calculated)
        pubAmountList.push({ pubAmount: calculatedEth, value: 0, txHash: record.transactionHash })
      }
    })
    setTxRecords(pubAmountList.reverse())
  }

  return (
    <div className="pb-4 pt-4 px-6 sm:px-10">
      <ul>
        {txRecords.map((record, index) =>
          record.value === 1 ? (
            <li
              className="bg-[#1A73E8] text-white rounded-md font-bold transition-all duration-150 hover:cursor-pointer hover:bg-opacity-75 text-lg"
              key={index}
            >
              <a
                href={`${CHAINS[ChainId.ETHEREUM_SEPOLIA].blockExplorerUrl}/tx/${record.txHash}`}
                className="flex justify-between items-center py-3 px-3 my-4"
                target="_blank"
              >
                <span className="bg-white text-black w-24 inline-block py-2 px-2 rounded-md mr-2 text-center text-base">Deposit</span> +
                {record.pubAmount} ETH
              </a>
            </li>
          ) : (
            <li
              className="bg-[#1A73E8] text-white rounded-md font-bold transition-all duration-150 hover:cursor-pointer hover:bg-opacity-75 text-lg"
              key={index}
            >
              <a
                href={`${CHAINS[ChainId.ETHEREUM_SEPOLIA].blockExplorerUrl}/tx/${record.txHash}`}
                className="flex justify-between items-center py-3 px-3 my-4"
                target="_blank"
              >
                <span className="bg-white text-black w-24 inline-block py-2 px-2 rounded-md mr-2 text-center text-base">Withdraw</span> -
                {record.pubAmount} ETH
              </a>
            </li>
          )
        )}
      </ul>
    </div>
  )
}

export default HistoryComponent
