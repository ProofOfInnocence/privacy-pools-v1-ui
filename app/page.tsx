'use client'

import { Keypair, Utxo, createTransactionData, workerProvider } from '@/services'
import { ChainId } from '@/types'
import { toWei } from 'web3-utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function Home() {
  const { address, isConnecting, isDisconnected, connector } = useAccount()

  async function deposit() {
    if (!connector) return
    const provider = await connector.getProvider()
    console.log("provider", provider)

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
      <ConnectButton />
    </div>
  )
}
