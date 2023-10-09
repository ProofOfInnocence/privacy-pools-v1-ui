'use client'

import { Keypair, Utxo, createTransactionData, workerProvider } from '@/services'
import { ChainId } from '@/types'
import { toWei } from 'web3-utils'
export default function Home() {
  async function deposit() {
    workerProvider.workerSetup(ChainId.ETHEREUM_GOERLI)
    const keypair = new Keypair()
    const output = new Utxo({ amount: toWei('0.1'), keypair })
    // const input = new Utxo({ amount: toWei('0.1'), keypair })
    const transactionInputOutputs = {
      outputs: [output],
    }
    const { extData, args } = await createTransactionData(transactionInputOutputs, keypair)
    console.log(extData, args)
  }

  return (
    <div>
      <button onClick={deposit}>AJDBHKG</button>
    </div>
  )
}
