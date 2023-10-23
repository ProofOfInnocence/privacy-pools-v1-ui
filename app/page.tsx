'use client'

import { Keypair, Utxo, createTransactionData, getProvider, utxoFactory, workerProvider } from '@/services'
import { ChainId, LogLevel } from '@/types'
import { toWei } from 'web3-utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContractWrite, usePrepareContractWrite, usePublicClient, useSignMessage, useWalletClient } from 'wagmi'
import { BG_ZERO, POOL_CONTRACT, SIGN_MESSAGE } from '@/constants'
import { useEffect, useState } from 'react'
import { encodeTransactData, generatePrivateKeyFromEntropy, toChecksumAddress, toHexString } from '@/utilities'
import { BaseError, ContractFunctionRevertedError, numberToHex, toRlp } from 'viem'
import { UnspentUtxoData } from '@/services/utxoService/@types'
import { BigNumber } from 'ethers'

import { ArgsProof, ExtData, MembershipProof } from '@/services/core/@types'
import axios from 'axios'
import DepositComponent from '@/components/Deposit'
import WithdrawComponent from '@/components/Withdraw'
import Logo from '@/components/Logo'
import { RelayerInfo } from '@/types'
import Balance from '@/components/Balance'
import { getWrappedToken } from '@/contracts'
import { PrivacyPool__factory as TornadoPool__factory, WETH__factory } from '@/_contracts'
import { getUtxoFromKeypair, prepareTransaction } from '@/store/account'
import ErrorModal from '@/components/Error'
import { handleAllowance, transact } from '@/store/wallet'
import LoadingSpinner from '@/components/Loading'

const relayers: RelayerInfo[] = [
  { name: 'Relayer1', api: 'http://172.16.20.111:8000', fee: 0.05, rewardAddress: '0x9fCDf8f60d3009656E50Bf805Cd53C7335b284Fb' },
  { name: 'Relayer2', api: 'http://api2.com', fee: 15, rewardAddress: '0x9fCDf8f60d3009656E50Bf805Cd53C7335b284Fb' },
  // ... other relayers
]

export default function Home() {
  const [error, setError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [poolBalance, setPoolBalance] = useState(0)
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [activeTab, setActiveTab] = useState('deposit')

  const logger = (message: string, logType: LogLevel = LogLevel.DEBUG) => {
    if (logType === LogLevel.ERROR) {
      setError(message)
    }
    if (logType === LogLevel.LOADING) {
      setLoadingMessage(message)
    }
    console.log(message)
  }

  const { signMessage } = useSignMessage({
    message: SIGN_MESSAGE,
    onSuccess(data) {
      const privateKey = generatePrivateKeyFromEntropy(data)
      const keypair = new Keypair(privateKey)
      console.log(keypair.address())
      workerProvider.workerSetup(ChainId.ETHEREUM_GOERLI)
      initKeypair(keypair)
    },
    onError(error) {
      setError(error.message)
    },
  })

  const { address, connector } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    initializeKeypair()
  }, [connector, keypair, signMessage])

  async function initializeKeypair() {
    if (!keypair && connector != null) {
      try {
        setLoadingMessage('Sign message to initialize')
        await signMessage()
        setLoadingMessage('')
      } catch (error) {
        setLoadingMessage('')
        setError(error.message)
      }
    }
  }

  async function syncPoolBalance() {
    if(!keypair) {
      return
    }
    if(!address) {
      return
    }
    const { totalAmount } = await getUtxoFromKeypair({ keypair, accountAddress: address, withCache: false })
    setPoolBalance(totalAmount)
  }


  async function initKeypair(keypair: Keypair) {
    try {
      setLoadingMessage('Initilazing...')
      setKeypair(keypair)
      if (!address) {
        throw new Error('Address is null')
      }

      const { totalAmount } = await getUtxoFromKeypair({ keypair, accountAddress: address, withCache: false })
      setPoolBalance(totalAmount)
      setLoadingMessage('')
    } catch (error) {
      setLoadingMessage('')
      setError(error.message)
    }
  }

  async function deposit(amount: string) {
    try {
      setLoadingMessage('Depositing...')
      if (!keypair) {
        throw new Error('Keypair is null')
      }
      if (!walletClient) {
        throw new Error('Wallet client is null')
      }
      await handleAllowance({ publicClient, walletClient, logger }, amount)
      if (!address) {
        throw new Error('Address is null')
        return
      }
      const { extData, args } = await prepareTransaction({
        keypair,
        amount: BigNumber.from(toWei(amount)),
        address: address,
      })
      await transact({ publicClient, walletClient, logger, syncPoolBalance }, { args, extData })
      setLoadingMessage('')
    } catch (error) {
      setLoadingMessage('')
      setError(error.message)
    }
  }

  async function withdrawWithRelayer(amount: string, recipient: string, relayer: RelayerInfo) {
    try {
      setLoadingMessage('Withdrawing...')
      if (!keypair) {
        throw new Error('Keypair is null')
        return
      }
      if (!address) {
        throw new Error('Address is null')
      }
      if (!walletClient) {
        throw new Error('Wallet client is null')
      }
      const totalAmount = BigNumber.from(toWei(amount))
      const { extData, args, membershipProof } = await prepareTransaction({
        keypair,
        amount: totalAmount,
        address: toChecksumAddress(address),
        fee: BG_ZERO,
        // relayer: toChecksumAddress(relayer.rewardAddress),
        recipient: toChecksumAddress(recipient),
      })
      console.log('Ext data', extData)
      console.log('Args', args)
      let newExtData: ExtData = { ...extData }
      newExtData.extAmount = BigNumber.from(extData.extAmount).toBigInt()

      await transact({ publicClient, walletClient, logger, syncPoolBalance }, { args, extData: newExtData })
      setLoadingMessage('')
    } catch (error) {
      setLoadingMessage('')
      setError(error.message)
    }
    // await sendToRelayer(relayer.rewardAddress, { extData, args })
  }

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 shadow-md flex justify-between items-center">
        <Logo />

        <div className="flex items-center space-x-4">
          <Balance shieldedBalance={poolBalance} /> {/* Replace 123.45 with dynamic value if needed */}
          <ConnectButton />
        </div>
      </header>

      {/* Main content */}
      <div className="flex justify-center pt-8">
        <div className="bg-white rounded-lg shadow-md p-0 w-96">
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
          {activeTab === 'deposit' ? (
            <DepositComponent deposit={deposit} balance={0.0001} />
          ) : (
            <WithdrawComponent withdrawWithRelayer={withdrawWithRelayer} relayers={relayers} />
          )}
          <ErrorModal errorMessage={error} />
          <LoadingSpinner loadingMessage={loadingMessage} />
        </div>
      </div>
    </div>
  )
}
