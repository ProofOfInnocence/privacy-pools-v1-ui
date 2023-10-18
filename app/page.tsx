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
import DepositComponent from '@/components/Deposit'
import WithdrawComponent from '@/components/Withdraw'
import Logo from '@/components/Logo'
import { RelayerInfo } from '@/types'

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
    console.log('Ether amount:', etherAmount.toString())
    const amountWithFee = etherAmount.add(BigNumber.from(toWei(fee)))
    console.log('Amount with fee:', amountWithFee.toString())

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
const relayers: RelayerInfo[] = [
  { name: 'Relayer1', api: 'http://172.16.20.111:8000', fee: 0.05, rewardAddress: '0x9fCDf8f60d3009656E50Bf805Cd53C7335b284Fb' },
  { name: 'Relayer2', api: 'http://api2.com', fee: 15, rewardAddress: '0x9fCDf8f60d3009656E50Bf805Cd53C7335b284Fb' },
  // ... other relayers
]

export default function Home() {
  const WITHDRAW_ADDRESS = '0x9fCDf8f60d3009656E50Bf805Cd53C7335b284Fb'
  const [error, setError] = useState('')
  const [poolBalance, setPoolBalance] = useState('')
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [relayerURL, setRelayerURL] = useState('http://172.16.20.111:8000')
  const [activeTab, setActiveTab] = useState('deposit');

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
      // signMessage()
      setKeypair(new Keypair())
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

  async function sendToRelayer(relayerURL: string, { extData, args }: { extData: ExtData; args: ArgsProof }) {
    const { data: res } = await axios.post(
      `${relayerURL}/transaction`,
      {
        args,
        extData,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log(res)
  }

  async function deposit(amount: string) {
    if (!keypair) {
      throw new Error('Keypair is null')
      return
    }
    const output = new Utxo({ amount: toWei(amount), keypair })
    // const input = new Utxo({ amount: toWei('0.1'), keypair })
    const transactionInputOutputs = {
      outputs: [output],
    }
    const { extData, args } = await createTransactionData(transactionInputOutputs, keypair)

    // await sendToRelayer({ extData, args })
    await transact({ args, extData })
  }

  async function withdrawWithRelayer(amount: string, recipient: string, relayer: RelayerInfo) {
    if (!keypair) {
      throw new Error('Keypair is null')
      return
    }
    if (!address) {
      throw new Error('Address is null')
    }
    const { extData, args } = await prepareWithdrawal({
      keypair,
      amount,
      address: toChecksumAddress(recipient),
      fee: relayer.fee.toString(),
      relayer: toChecksumAddress(relayer.rewardAddress),
    })

    await sendToRelayer(relayer.rewardAddress, { extData, args })
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
    <div className="h-screen bg-gray-100">
    {/* Header */}
    <header className="bg-white p-4 shadow-md flex justify-between items-center">
      <Logo />
      <ConnectButton /> {/* I'm not defining this as per your instructions. */}
    </header>

    {/* Main content */}
    <div className="flex justify-center items-center h-full">
      <div className="bg-white rounded-lg shadow-md p-4 w-64">
        {/* Tabs */}
        <div className="mb-4 flex border-b">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`py-2 px-4 ${activeTab === 'deposit' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          >
            Deposit
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`py-2 px-4 ${activeTab === 'withdraw' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          >
            Withdraw
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'deposit' ? <DepositComponent  deposit={deposit} balance={0.0001}/> : <WithdrawComponent withdrawWithRelayer={withdrawWithRelayer} relayers={relayers} />}
      </div>
    </div>
  </div>

    // <div>
    //   {/* <button onClick={()=>{deposit("0.000031")}}>AJDBHKG</button> */}
    //   <DepositComponent deposit={deposit} balance={0.0001} />
    //   <WithdrawComponent withdrawWithRelayer={withdrawWithRelayer} relayers={relayers} />
    //   <button onClick={getBalance}>Get balance</button>
    //   {/* <button onClick={withdraw}>Withdraw</button> */}
    //   <h1>Pool Balance: {poolBalance}</h1>
    //   <ConnectButton />
    //   {error && <div>{error}</div>}
    // </div>
  )
}
