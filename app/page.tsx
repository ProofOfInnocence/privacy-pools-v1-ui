'use client'

import { Keypair, Utxo, createTransactionData, utxoFactory, workerProvider } from '@/services'
import { ChainId } from '@/types'
import { toWei } from 'web3-utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContractWrite, usePrepareContractWrite, usePublicClient, useSignMessage, useWalletClient } from 'wagmi'
import { POOL_CONTRACT, SIGN_MESSAGE } from '@/constants'
import { useEffect, useState } from 'react'
import { encodeTransactData, generatePrivateKeyFromEntropy, toChecksumAddress, toHexString } from '@/utilities'
import { TornadoPool__factory } from '@/_contracts'
import { BaseError, ContractFunctionRevertedError } from 'viem'
import { UnspentUtxoData } from '@/services/utxoService/@types'
import { BigNumber } from 'ethers'
import { ArgsProof, ExtData } from '@/services/core/@types'

async function getUtxoFromKeypair({
  keypair,
  accountAddress,
  withCache = false,
}: {
  keypair: Keypair
  accountAddress: string
  withCache: boolean
}) {
  try {
    // if (!getters.accountAddress) {
    //   return { unspentUtxo: [], totalAmount: BG_ZERO }
    // }
    const utxoService = utxoFactory.getService(ChainId.ETHEREUM_GOERLI, accountAddress)
    const { totalAmount, unspentUtxo, freshUnspentUtxo, freshDecryptedEvents } = await utxoService.fetchUnspentUtxo({
      keypair,
      withCache,
      accountAddress: accountAddress,
      callbacks: {
        update: (payload: UnspentUtxoData) => {
          console.log(payload.accountAddress)
          if (payload.accountAddress === accountAddress) {
            console.log('Update account balance', payload.totalAmount.toString())
          }
        },
        set: (payload: UnspentUtxoData) => {
          console.log(payload.accountAddress)
          if (payload.accountAddress === accountAddress) {
            console.log('Set account balance', payload.totalAmount.toString())
          }
        },
      },
    })

    if (freshUnspentUtxo.length) {
      console.log('Check unspent utxo')
      console.log(freshUnspentUtxo)
      console.log(freshDecryptedEvents)
      // dispatch('checkUnspentUtxo', { unspentUtxo: freshUnspentUtxo, decryptedEvents: freshDecryptedEvents })
    }

    return { unspentUtxo, totalAmount }
  } catch (err) {
    throw new Error(`Method getUtxoFromKeypair has error: ${err.message}`)
  }
}

async function prepareWithdrawal({
  keypair,
  amount,
  address,
  fee = '0',
}: {
  keypair: Keypair
  amount: string
  address: string
  fee: string
}) {
  try {
    const etherAmount = BigNumber.from(toWei(amount))
    const amountWithFee = etherAmount.add(BigNumber.from(fee))

    const { unspentUtxo, totalAmount } = await getUtxoFromKeypair({
      keypair,
      accountAddress: address,
      withCache: true,
    })

    // if (totalAmount.lt(amountWithFee)) {
    //   throw new Error(`${errors.validation.INSUFFICIENT_FUNDS} ${fromWei(totalAmount)}`)
    // }

    const outputs = [new Utxo({ amount: totalAmount.sub(amountWithFee), keypair })]

    const { extData, args } = await createTransactionData(
      {
        l1Fee: BigNumber.from(fee),
        outputs,
        isL1Withdrawal: true,
        inputs: unspentUtxo,
        recipient: toChecksumAddress(address),
      },
      keypair
    )

    return { extData, args }
  } catch (err) {
    throw new Error(err.message)
  }
}

export default function Home() {
  const WITHDRAW_ADDRESS = '0x9fCDf8f60d3009656E50Bf805Cd53C7335b284Fb'
  const [error, setError] = useState('')
  const [poolBalance, setPoolBalance] = useState('')
  const [keypair, setKeypair] = useState<Keypair | null>(null)

  const { signMessage } = useSignMessage({
    message: SIGN_MESSAGE,
    onSuccess(data) {
      const privateKey = generatePrivateKeyFromEntropy(data)
      const keypair = new Keypair(privateKey)
      console.log(keypair.address())
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
      signMessage()
    }
  }, [connector])

  async function getBalance() {
    workerProvider.workerSetup(ChainId.ETHEREUM_GOERLI)
    if (!keypair) {
      throw new Error('Keypair is null')
      return
    }
    if (!address) {
      throw new Error('Address is null')
      return
    }

    const { unspentUtxo, totalAmount } = await getUtxoFromKeypair({ keypair, accountAddress: address, withCache: false })
    console.log(unspentUtxo)
    console.log(totalAmount)
    setPoolBalance(totalAmount.toString())
  }

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
    const { extData, args } = await createTransactionData(transactionInputOutputs, keypair)

    await transact({ args, extData })
  }

  async function transact({ args, extData }: { args: ArgsProof; extData: ExtData }) {
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

  return (
    <div>
      <button onClick={deposit}>AJDBHKG</button>
      <button onClick={getBalance}>Get balance</button>
      <h1>Pool Balance: {poolBalance}</h1>
      <ConnectButton />
      {error && <div>{error}</div>}
    </div>
  )
}
