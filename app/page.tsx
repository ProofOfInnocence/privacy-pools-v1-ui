'use client'

import { Keypair, workerProvider } from '@/services'
import { ChainId, LogLevel } from '@/types'
import { toWei } from 'web3-utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useNetwork, usePublicClient, useSignMessage, useWalletClient } from 'wagmi'
import { POOL_CONTRACT, SIGN_MESSAGE } from '@/constants'
import { useEffect, useState } from 'react'
import { generatePrivateKeyFromEntropy, toChecksumAddress, toHexString } from '@/utilities'
import { encodeFunctionData } from 'viem'
import { BigNumber } from 'ethers'
import { PrivacyPool__factory as TornadoPool__factory } from '@/_contracts'

import { ExtData } from '@/services/core/@types'
import DepositComponent from '@/components/Deposit'
import WithdrawComponent from '@/components/Withdraw'
import Logo from '@/components/Logo'
import { RelayerInfo } from '@/types'
import Balance from '@/components/Balance'
import { getUtxoFromKeypair, prepareTransaction } from '@/store/account'
import ErrorModal from '@/components/Error'
import { handleAllowance, handleWrapEther, transact } from '@/store/wallet'
import LoadingSpinner from '@/components/Loading'
import WrapEtherComponent from '@/components/WrapEtherComponent'
import { sendToRelayer } from '@/store/relayer'

const relayers: RelayerInfo[] = [
  { name: 'Local Relayer', api: 'http://127.0.0.1:8000', fee: '10000000000', rewardAddress: '0x952198215a9D99bE8CEFc791337B909bF520d98F' },
]

export default function Home() {
  const [error, setError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [poolBalance, setPoolBalance] = useState(0)
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [activeTab, setActiveTab] = useState('deposit')
  const [curChainId, setCurChainId] = useState(0)
  const [curAddress, setCurAddress] = useState('')

  const { address, connector } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork()

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

  useEffect(() => {
    if (curChainId != 0 && chain && chain.id !== curChainId) {
      setError('Unsupported chain')
    }
  }, [chain])

  useEffect(() => {
    if (curAddress != '' && address && address !== curAddress) {
      setKeypair(null)
      setPoolBalance(0)
      setCurAddress('')
    }
  }, [address])

  async function initializeKeypair() {
    if (!connector || !address) {
      setError('Connect your wallet first')
      return
    }
    try {
      setLoadingMessage('Sign message to initialize')
      setCurAddress(address)
      setCurChainId(chain?.id || 0)
      signMessage()
      setLoadingMessage('')
    } catch (error) {
      setLoadingMessage('')
      setError(error.message)
    }
  }

  async function syncPoolBalance() {
    if (!keypair) {
      return
    }
    if (!address) {
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

  async function withdrawWithRelayer(amount: string, feeInWei: string, recipient: string, relayer: RelayerInfo) {
    try {
      setLoadingMessage('Withdrawing...')
      if (!keypair) {
        throw new Error('Keypair is null')
      }
      if (!address) {
        throw new Error('Address is null')
      }
      if (!walletClient) {
        throw new Error('Wallet client is null')
      }
      const totalAmount = BigNumber.from(toWei(amount))
      const fee = BigNumber.from(feeInWei)

      const { extData, args, membershipProof } = await prepareTransaction({
        keypair,
        amount: totalAmount.sub(fee),
        address: toChecksumAddress(address),
        fee: fee,
        recipient: toChecksumAddress(recipient),
        relayer: toChecksumAddress(relayer.rewardAddress),
      })
      console.log('Ext data', extData)
      console.log('Args', args)
      let newExtData: ExtData = { ...extData }
      newExtData.extAmount = BigNumber.from(extData.extAmount).toBigInt().toString()
      if (!membershipProof) {
        throw new Error('Membership proof is null')
      }
      try {
        const { request } = await publicClient.simulateContract({
          address: toHexString(POOL_CONTRACT[ChainId.ETHEREUM_GOERLI]),
          abi: TornadoPool__factory.abi,
          functionName: 'transact',
          args: [args, newExtData],
          account: toHexString(relayer.rewardAddress || ''),
        })
        console.log('Request', request)
      } catch (error) {
        console.log('Error in simulate contract', error.message)
      }
      const functionData = encodeFunctionData({ abi: TornadoPool__factory.abi, functionName: 'transact', args: [args, newExtData] })
      console.log('Function data', functionData)
      await sendToRelayer(relayer, { extData: newExtData, args, membershipProof })
      // await transact({ publicClient, walletClient, logger, syncPoolBalance }, { args, extData: newExtData })
      setLoadingMessage('')
    } catch (error) {
      setLoadingMessage('')
      setError(error.message)
    }
  }

  async function wrapEther(amount: string) {
    try {
      setLoadingMessage('Depositing...')
      if (!walletClient) {
        throw new Error('Wallet client is null')
      }
      if (!address) {
        throw new Error('Address is null')
      }

      await handleWrapEther({ publicClient, walletClient, logger }, amount)

      setLoadingMessage('')
    } catch (error) {
      setLoadingMessage('')
      setError(error.message)
    }
  }

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 shadow-md flex justify-between items-center">
        <Logo />

        <div className="flex items-center space-x-4">
          {keypair && <Balance shieldedBalance={poolBalance} />}

          {!keypair && (
            <button onClick={initializeKeypair} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
              Initialize
            </button>
          )}
          <ConnectButton />
        </div>
      </header>

      {curAddress && (
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

              <button
                onClick={() => setActiveTab('wrapEther')}
                className={`py-2 px-4 ${activeTab === 'wrapEther' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              >
                Wrap ETH
              </button>
            </div>

            {activeTab === 'deposit' && <DepositComponent deposit={deposit} address={curAddress} />}
            {activeTab === 'wrapEther' && <WrapEtherComponent wrapEther={wrapEther} address={curAddress} />}
            {activeTab === 'withdraw' && (
              <WithdrawComponent withdrawWithRelayer={withdrawWithRelayer} relayers={relayers} logger={logger} />
            )}

            <ErrorModal isVisible={error !== ''} message={error} onClose={() => setError('')} />
            <LoadingSpinner loadingMessage={loadingMessage} />
          </div>
        </div>
      )}
    </div>
  )
}
