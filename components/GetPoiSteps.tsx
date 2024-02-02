import React, { useEffect, useState } from 'react'
import { Keypair, Utxo, workerProvider } from '@/services'
import { TxRecord } from '@/services/core/txRecord'
import { BigNumber } from 'ethers'
import { BG_ZERO, FIELD_SIZE } from '@/constants'
import { getUtxoFromKeypair } from '@/store/account'
import { toChecksumAddress } from 'web3-utils'

interface PoiStepsProps {
  keypair: Keypair
  address: string
  recipient?: any
  relayer?: any
  amount: BigNumber
  fee?: BigNumber
}

function GetPoiSteps({ keypair, address, recipient = BG_ZERO, relayer = BG_ZERO, amount, fee = BG_ZERO }: PoiStepsProps) {
  const [poiSteps, setPoiSteps] = useState()

  const fetchPoiSteps = async () => {
    const { unspentUtxo, totalAmount } = await getUtxoFromKeypair({
      keypair,
      accountAddress: address,
      withCache: true,
    })
    const amountWithFee = amount.add(fee)
    let outputAmount
    if (recipient == BG_ZERO) {
      outputAmount = totalAmount.add(amountWithFee)
    } else {
      if (totalAmount.lt(amountWithFee)) {
        throw new Error('Not enough funds')
      }
      outputAmount = totalAmount.sub(amountWithFee)
    }
    const outputs = [new Utxo({ amount: outputAmount, keypair })]
    const params = {
      outputs,
      inputs: unspentUtxo.length > 2 ? unspentUtxo.slice(0, 2) : unspentUtxo,
      recipient: recipient !== BG_ZERO ? toChecksumAddress(recipient) : undefined,
      relayer: relayer !== BG_ZERO ? toChecksumAddress(relayer) : undefined,
      fee: fee,
    }
    let extAmount = BigNumber.from(params.fee)
      .add(params.outputs.reduce((sum, x) => sum.add(x.amount), BG_ZERO))
      .sub(params.inputs.reduce((sum: { add: (arg0: any) => any }, x: { amount: any }) => sum.add(x.amount), BG_ZERO))
    const publicAmount = BigNumber.from(extAmount).sub(params.fee).add(FIELD_SIZE).mod(FIELD_SIZE).toString()

    const finalTxRecord = new TxRecord({
      publicAmount,
      inputs: params.inputs,
      outputs: params.outputs,
    })

    const txRecordEvents = await workerProvider.getTxRecordEvents()
    console.log('FINAL TX RECORD:', finalTxRecord)
    console.log('TX RECORD EVENTS: ', txRecordEvents)
  }

  useEffect(() => {
    fetchPoiSteps()
  }, [])

  return <div></div>
}

export default GetPoiSteps
