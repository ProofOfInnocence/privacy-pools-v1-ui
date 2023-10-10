'use client'

import { Keypair, Utxo, createTransactionData, workerProvider } from '@/services'
import { ChainId } from '@/types'
import { toWei } from 'web3-utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSignMessage } from 'wagmi'
import { SIGN_MESSAGE } from '@/constants'
import { useEffect, useState } from 'react'
import { generatePrivateKeyFromEntropy } from '@/utilities'

export default function Home() {
  const [error, setError] = useState('')
  const [keypair, setKeypair] = useState<Keypair | null>(null)

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: SIGN_MESSAGE,
    onSuccess(data) {
      const privateKey = generatePrivateKeyFromEntropy(data)
      const keypair = new Keypair(privateKey)
      setKeypair(keypair)
    },
    onError(error) {
      setError(error.message)
    },
  })

  const { connector } = useAccount()

  // useEffect(() => {
    
  // }, [])


  useEffect(() => {
    if (!keypair && connector != null) {
      console.log('Sign message')
      signMessage()
    }
  }, [connector])



  async function deposit() {
    workerProvider.workerSetup(ChainId.ETHEREUM_GOERLI)
    if (!keypair) {
      throw new Error('Keypair is null')
      return
    }
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
      {error && <div>{error}</div>}
    </div>
  )
}
