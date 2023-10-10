'use client'

import { Keypair, Utxo, createTransactionData, workerProvider } from '@/services'
import { ChainId } from '@/types'
import { toWei } from 'web3-utils'

export default function Home() {
  async function deposit() {
    workerProvider.workerSetup(ChainId.XDAI)
    const keypair = new Keypair()
    const output = new Utxo({ amount: toWei('0.1'), keypair })
    const input = new Utxo({ amount: toWei('0.1'), keypair })
    const transactionInputOutputs = {
      inputs: [input],
      outputs: [output],
    }
    const { extData, args } = await createTransactionData(transactionInputOutputs, keypair)
    console.log(extData, args)
  }

  async function genpp() {
    workerProvider.workerSetup(ChainId.XDAI)
    console.log("genpp called")
    let ppx = await workerProvider.generate_ppx()
    console.log("genpp done", ppx)
  }

  async function prove() {
    workerProvider.workerSetup(ChainId.XDAI)
    console.log("prove called")
    await workerProvider.provex()
    console.log("prove done")
  }

  async function verify() {
    workerProvider.workerSetup(ChainId.XDAI)
    console.log("verify called")
    await workerProvider.verifyx()
    console.log("verify done")
  }

  return (
    <div>
      <button onClick={deposit}>AJDBHKG</button>
      <button onClick={genpp}>Public Parameters</button>
      <button onClick={prove}>Prove</button>
      <button onClick={verify}>Verify</button>
    </div>
  )
}
