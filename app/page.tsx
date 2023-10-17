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
import axios from 'axios'

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
  relayer,
  fee = '0',
}: {
  keypair: Keypair
  amount: string
  address: string
  relayer: string
  fee: string
}) {
  try {
    const etherAmount = BigNumber.from(toWei(amount))
    console.log("Ether amount:", etherAmount.toString())
    const amountWithFee = etherAmount.add(BigNumber.from(toWei(fee)))
    console.log("Amount with fee:", amountWithFee.toString())

    const { unspentUtxo, totalAmount } = await getUtxoFromKeypair({
      keypair,
      accountAddress: address,
      withCache: true,
    })

    if (totalAmount.lt(amountWithFee)) {
      throw new Error('Insufficient balance')
    }

    const outputs = [new Utxo({ amount: totalAmount.sub(amountWithFee), keypair })]

    const { extData, args } = await createTransactionData(
      {
        outputs,
        inputs: unspentUtxo.length > 2 ? unspentUtxo.slice(0, 2) : unspentUtxo,
        recipient: toChecksumAddress(address),
        relayer: toChecksumAddress(relayer),
        fee: BigNumber.from(toWei(fee)),
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
  const [relayerURL, setRelayerURL] = useState('http://172.16.20.111:8000')

  const { signMessage } = useSignMessage({
    message: SIGN_MESSAGE,
    onSuccess(data) {
      const privateKey = generatePrivateKeyFromEntropy(data)
      const keypair = new Keypair(privateKey)
      console.log(keypair.address())
      setKeypair(keypair)
      workerProvider.workerSetup(ChainId.ETHEREUM_GOERLI)
    },
    onError(error) {
      setError(error.message)
    },
  })

  const { address, connector } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient, isError, isLoading } = useWalletClient()

  useEffect(() => {
    if (!keypair && connector != null) {
      console.log('Sign message')
      signMessage()
    }
  }, [connector])

  async function getBalance() {
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

  async function sendToRelayer({ extData, args }: { extData: ExtData; args: ArgsProof }) {
    // axios.post(`${relayerURL}/status`);
    const { data } = await axios.get(`${relayerURL}/status`)
    console.log(data)
    //     "curl -X POST -H 'content-type:application/json' --data '" +
    // JSON.stringify(txData) +
    // "' http://127.0.0.1:8000/transaction"
    const headers = {
      'Content-Type': 'application/json',
    }

    const { data: res } = await axios.post(
      `${relayerURL}/transaction`,
      {
        args,
        extData,
      },
      { headers }
    )
    console.log(res)
  }

  async function deposit() {
    if (!keypair) {
      throw new Error('Keypair is null')
      return
    }
    const output = new Utxo({ amount: toWei('0.0001'), keypair })
    // const input = new Utxo({ amount: toWei('0.1'), keypair })
    const transactionInputOutputs = {
      outputs: [output],
      relayer: '0x0f820f428AE436C1000b27577bF5bbf09BfeC8f2',
      fee: BigNumber.from('10000000000'),
      isL1Withdrawal: false,
      l1Fee: BigNumber.from('0'),
    }
    const { extData, args } = await createTransactionData(transactionInputOutputs, keypair)

    // await sendToRelayer({ extData, args })
    await transact({ args, extData })
  }

  async function withdraw() {
    if (!keypair) {
      throw new Error('Keypair is null')
      return
    }
    if (!address) {
      throw new Error('Address is null')
      return
    }
    const amount = toWei('0.0001')
    const fee = toWei('0.0001')
    // const relayerFee = 
    const { data } = await axios.get(`${relayerURL}/status`) // data = 




    const { extData, args } = await prepareWithdrawal({
      keypair,
      amount: '0.0001',
      address: WITHDRAW_ADDRESS,
      fee: '0.00001',
      relayer: toChecksumAddress(data.rewardAddress),
    })

    await sendToRelayer({ extData, args })

    // await transact({ args, extData })
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
      <button onClick={withdraw}>Withdraw</button>
      <h1>Pool Balance: {poolBalance}</h1>
      <ConnectButton />
      {error && <div>{error}</div>}
    </div>
  )
}
