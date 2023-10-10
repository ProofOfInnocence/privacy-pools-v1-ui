'use client'

import { Keypair, Utxo, createTransactionData, workerProvider } from '@/services'
import { ChainId } from '@/types'
import { toWei } from 'web3-utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContractWrite, usePrepareContractWrite, usePublicClient, useSignMessage, useWalletClient } from 'wagmi'
import { POOL_CONTRACT, SIGN_MESSAGE } from '@/constants'
import { useEffect, useState } from 'react'
import { encodeTransactData, generatePrivateKeyFromEntropy, toHexString } from '@/utilities'
import { TornadoPool__factory } from '@/_contracts'
import { BaseError, ContractFunctionRevertedError } from 'viem'

export default function Home() {
  const [error, setError] = useState('')
  const [keypair, setKeypair] = useState<Keypair | null>(null)

  const { signMessage } = useSignMessage({
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

  const { address, connector } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient, isError, isLoading } = useWalletClient()

  // useEffect(() => {

  // }, [])

  useEffect(() => {
    if (!keypair && connector != null) {
      console.log('Sign message')
      // signMessage()
      setKeypair(new Keypair())
    }
  }, [connector])

  async function deposit() {
    workerProvider.workerSetup(ChainId.ETHEREUM_GOERLI)
    if (!keypair) {
      throw new Error('Keypair is null')
      return
    }
    const output = new Utxo({ amount: toWei('0.0001'), keypair })
    // const input = new Utxo({ amount: toWei('0.1'), keypair })
    const transactionInputOutputs = {
      outputs: [output],
    }
    const { extData, args, amount } = await createTransactionData(transactionInputOutputs, keypair)
    console.log(extData, args)
    console.log(JSON.stringify({ args, extData }))
    console.log(publicClient.chain)
    const encoded = encodeTransactData({ args, extData })
    console.log(encoded)
    if (!walletClient) {
      throw new Error('Wallet client is null')
      return
    }

    const [address] = await walletClient.getAddresses()
    console.log('Address', address)

    const { request } = await publicClient.simulateContract({
      address: toHexString(POOL_CONTRACT[ChainId.ETHEREUM_GOERLI]),
      abi: TornadoPool__factory.abi,
      functionName: 'transact',
      args: [args, extData],
      account: address,
    })
    console.log('Request', request)
    if (!walletClient) {
      throw new Error('Wallet client is null')
      return
    }
    const hash = await walletClient.writeContract(request)
    console.log(hash)
  }

  async function tryCatchWrapper(func: () => Promise<any>) {
    try {
      await func()
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div>
      <button onClick={deposit}>AJDBHKG</button>
      <ConnectButton />
      {error && <div>{error}</div>}
    </div>
  )
}
