'use client'

import { Keypair, workerProvider } from '@/services'
import { ChainId, LogLevel, LoggerType } from '@/types'
import { toWei } from 'web3-utils'
import CustomConnectButton from '@/components/CustomConnectButton'
import { useAccount, useBalance, useNetwork, usePublicClient, useSignMessage, useWalletClient } from 'wagmi'
import { POOL_CONTRACT, SIGN_MESSAGE, WRAPPED_TOKEN, errorTypes, numbers } from '@/constants'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import bgPattern from '@/public/images/bg-pattern.webp'


import { fromWei, generatePrivateKeyFromEntropy, toChecksumAddress, toHexString } from '@/utilities'
import { WriteContractErrorType, encodeFunctionData } from 'viem'
import { BigNumber } from 'ethers'
import { PrivacyPool__factory as TornadoPool__factory } from '@/_contracts'

import { ExtData } from '@/services/core/@types'
import DepositComponent from '@/components/Deposit'
import WithdrawComponent from '@/components/Withdraw'
import Logo from '@/components/Logo'
import { RelayerInfo } from '@/types'
import { getUtxoFromKeypair, prepareMembershipProof, prepareTransaction } from '@/store/account'
import ErrorModal from '@/components/Error'
import { handleAllowance, handleWrapEther, transact } from '@/store/wallet'
import LoadingSpinner from '@/components/Loading'
// import WrapEtherComponent from '@/components/WrapEtherComponent'
import { sendToRelayer } from '@/store/relayer'
import Modal, { ModalProps } from '@/components/Modal'
import Description from '@/components/Description'
import GeneratePool from '@/components/GeneratePool'
import StatsComponent from '@/components/StatsComponent'
import HistoryComponent from '@/components/HistoryComponent'
import { CHAINS } from '@/constants'
import { getGasPriceFromRpc } from '@/services/gasOracle'

const relayers: RelayerInfo[] = [
  {
    name: 'oxbow relay',
    api: 'http://0.0.0.0:8000',
  },
]

export default function Home() {
  const [error, setError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [poolBalance, setPoolBalance] = useState(0)
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [activeTab, setActiveTab] = useState('deposit')
  const [curChainId, setCurChainId] = useState(0)
  const [curAddress, setCurAddress] = useState('')
  const [connectedAddress, setConnectedAddress] = useState('')
  const [modalData, setModalData] = useState({} as ModalProps)
  const [isDisabled, setIsDisabled] = useState(true)
  const [isKeyGenerated, setIsKeyGenerated] = useState(false)
  const [wethBalance, setWethBalance] = useState('0')

  const { address, connector } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork()

  // const WETHbalance = useBalance({
  //   address: curAddress as `0x${string}`,
  //   token: WRAPPED_TOKEN[ChainId.ETHEREUM_SEPOLIA] as `0x${string}`,
  //   watch: true,
  //   onSuccess(data) {
  //     const formattedNumber = parseFloat(data.formatted).toFixed(5)
  //     setWethBalance(formattedNumber)
  //   },
  // })

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
      workerProvider.workerSetup(ChainId.ETHEREUM_SEPOLIA)
      initKeypair(keypair)
    },
    onError(error) {
      if (error.name === errorTypes.USER_REJECTED_REQ_ERR.name) setError(errorTypes.USER_REJECTED_REQ_ERR.message)
      else setError(error.message)
    },
  })

  useEffect(() => {
    if (curChainId != 0 && chain && chain.id !== curChainId) {
      setError('Unsupported chain')
    }
  }, [chain, curChainId])

  useEffect(() => {
    if (address && address !== connectedAddress) {
      setConnectedAddress(address)
    }
  }, [address, connectedAddress])

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
      setLoadingMessage('Initializing...')
      setKeypair(keypair)
      if (!address) {
        throw new Error('Address is null')
      }
      const { totalAmount } = await getUtxoFromKeypair({ keypair, accountAddress: address, withCache: false })
      setPoolBalance(totalAmount)
      setLoadingMessage('')
      setIsKeyGenerated(true)
      setIsDisabled(false)
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
      // if (Number(amount) > poolBalance) {
      //   console.log(Number(amount), poolBalance);
      //   throw new Error('Amount cannot be bigger than user balance!')
      // }
      if (parseFloat(amount) < 0) {
        throw new Error('Amount cannot be negative number!')
      }
      if (isNaN(parseFloat(amount))) {
        throw new Error('Invalid decimal value')
      }
      // await handleAllowance({ publicClient, walletClient, logger }, amount)
      if (!address) {
        throw new Error('Address is null')
      }
      const { extData, args } = await prepareTransaction(
        {
          keypair,
          amount: BigNumber.from(toWei(amount)),
          address: curAddress,
        },
        logger
      )
      let txReceipt = await transact({ publicClient, walletClient, logger, syncPoolBalance }, { args, extData })
      setLoadingMessage('')
      console.log('Tx receipt', txReceipt)
      setModalData({
        title: 'Deposit success',
        text: 'Your deposit is successful',
        operations: [
          {
            ButtonName: 'OK',
            Function: () => {
              setModalData((prevModalData) => ({
                ...prevModalData,
                isVisible: false,
              }))
            },
          },
          {
            ButtonName: 'Explorer',
            Function: () => {
              window.open(`${CHAINS[ChainId.ETHEREUM_SEPOLIA].blockExplorerUrl}/tx/${txReceipt.transactionHash}`, '_blank')
            },
          },
        ],
        isVisible: true,
        onClose: () => {
          setModalData((prevModalData) => ({
            ...prevModalData,
            isVisible: false,
          }))
        },
      })
    } catch (error) {
      console.log(error)

      setLoadingMessage('')
      if (error.name === errorTypes.TX_EXEC_ERR.name) {
        setError(errorTypes.TX_EXEC_ERR.message)
      } else if (error.name === errorTypes.CONTRACT_EXEC_ERR.name) {
        setError(errorTypes.CONTRACT_EXEC_ERR.message)
      } else if (error.name === errorTypes.TX_RECEIPT_NOT_FOUND.name) {
        setError(errorTypes.TX_RECEIPT_NOT_FOUND.message)
      } else if (error.name === errorTypes.TX_NOT_FOUND_ERR.name) {
        setError(errorTypes.TX_NOT_FOUND_ERR.message)
      } else setError(error.message)
    }
  }

  async function getRelayerFees(relayer: RelayerInfo): Promise<{ transferServiceFee: string; withdrawalServiceFee: number, relayerRewardAddress: string }> {
    try {
      const { data: res } = await axios.get(`${relayer.api}/status`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return { transferServiceFee: res.serviceFee.transfer, withdrawalServiceFee: res.serviceFee.withdrawal, relayerRewardAddress: res.rewardAddress }
    } catch (error) {
      throw new Error('Failed to get relayer fees')
    }
  }

  async function calculateRelayerFee(amount: BigNumber, transferServiceFee: string, withdrawalServiceFee: number) {
    const { fast } = await getGasPriceFromRpc(ChainId.ETHEREUM_SEPOLIA)
    console.log("GAS FEE FOR FAST IS", fast)
    const gasLimit = BigNumber.from(2000000)
    const operationFee = BigNumber.from(fast).mul(gasLimit).mul('130').div(numbers.ONE_HUNDRED)
    const serviceFee = BigNumber.from(transferServiceFee)
    const desiredFee = operationFee.add(serviceFee)
    // amount * withdrawalServiceFee / 100 + desiredFee
    const share = Number(withdrawalServiceFee) / 100
    const fee = amount.mul(toWei(share.toString())).div(toWei('1', 'ether')).add(desiredFee)
    return fee
  }

  async function withdrawWithRelayer(amount: string, feeInWei: string, recipient: string, relayer: RelayerInfo, membershipProofOption: number) {
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
      if (Number(amount) > poolBalance) {
        throw new Error('Amount cannot be bigger than private balance!')
      }
      if (toHexString(recipient) === toHexString('') || recipient === undefined || toHexString(recipient).length !== 42) {
        throw new Error('Invalid address')
      }

      if (parseFloat(amount) < 0) {
        throw new Error('Amount cannot be negative number!')
      }
      if (isNaN(parseFloat(amount))) {
        throw new Error('Invalid decimal value')
      }
      // First we generate membership proof
      const { membershipProof, membershipProofURI } = await prepareMembershipProof(
        { keypair, address: toChecksumAddress(curAddress), membershipProofOption },
        logger
      )

      // Then we calculate the fee and the total amount
      const { transferServiceFee, withdrawalServiceFee, relayerRewardAddress } = await getRelayerFees(relayer)
      console.log('Relayer fees', transferServiceFee, withdrawalServiceFee)

      const totalAmount = BigNumber.from(toWei(amount))

      const fee = await calculateRelayerFee(totalAmount, transferServiceFee, withdrawalServiceFee)

      console.log(totalAmount, fee)

      // After we generate transaction details.
      const { extData, args } = await prepareTransaction(
        {
          keypair,
          amount: totalAmount.sub(fee),
          address: toChecksumAddress(curAddress),
          fee: fee,
          recipient: toChecksumAddress(recipient),
          relayer: toChecksumAddress(address),
          membershipProofURI,
        },
        logger
      )
      console.log('membershipProof', membershipProof)

      console.log('Ext data', extData)
      console.log('Args', args)
      let newExtData: ExtData = { ...extData }
      newExtData.extAmount = BigNumber.from(extData.extAmount).toBigInt().toString()
      if (!membershipProof) {
        throw new Error('Membership proof is null')
      }
      try {
        const { request } = await publicClient.simulateContract({
          address: toHexString(POOL_CONTRACT[ChainId.ETHEREUM_SEPOLIA]),
          abi: TornadoPool__factory.abi,
          functionName: 'transact',
          args: [args, newExtData],
          account: toHexString(relayerRewardAddress || ''),
        })
        console.log('Request', request)
      } catch (error) {
        console.log('Error in simulate contract', error.message)
      }
      logger('', LogLevel.LOADING)

      async function onSendingApproval() {
        try {
          logger('Sending to relayer', LogLevel.LOADING)
          const res = await sendToRelayer(relayer, { extData: newExtData, args, membershipProof })
          await checkWithdrawal(relayers[0], res, logger)
        } catch (error) {
          setLoadingMessage('')
          setError(error.message)
        }
      }

      setModalData({
        title: 'Are you sure',
        text: `You are withdrawing with a membership proof to a set 0xbow provided.`,
        operations: [
          {
            ButtonName: 'OK',
            Function: () => {
              setModalData((prevModalData) => ({
                ...prevModalData,
                isVisible: false,
              }))
              onSendingApproval()
            },
          },
          {
            ButtonName: 'Cancel',
            Function: () => {
              setModalData((prevModalData) => ({
                ...prevModalData,
                isVisible: false,
              }))
            },
          },
        ],
        isVisible: true,
        onClose: () => {
          setModalData((prevModalData) => ({
            ...prevModalData,
            isVisible: false,
          }))
        },
        feeData: fromWei(fee, 'ether'),
      })

      // await transact({ publicClient, walletClient, logger, syncPoolBalance }, { args, extData: newExtData })
    } catch (error) {
      setLoadingMessage('')
      setError(error.message)
    }
  }

  async function checkWithdrawal(relayer: RelayerInfo, jobId: void, logger: LoggerType) {
    return new Promise<void>((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          logger('Waiting for relayer', LogLevel.LOADING)
          const { data: res } = await axios.get(`${relayer.api}/job/${jobId}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (res.status === 'SENT') {
            setLoadingMessage('')
            getWithdrawModal(res.txHash)
            clearInterval(intervalId)
            resolve()
          } else if (res.status === 'FAILED') {
            clearInterval(intervalId)
            reject(new Error('Relayer failed with Error: ' + JSON.stringify(res.failedReason)))
          }
          console.log('STATUS', res)
        } catch (error) {
          clearInterval(intervalId)
          reject(error)
        }
      }, 1000)
    })
  }

  function getWithdrawModal(txHash: string) {
    setModalData({
      title: 'Withdraw success',
      text: `Your withdraw is successful`,
      operations: [
        {
          ButtonName: 'OK',
          Function: () => {
            setModalData((prevModalData) => ({
              ...prevModalData,
              isVisible: false,
            }))
          },
        },
        {
          ButtonName: 'Explorer',
          Function: () => {
            window.open(`${CHAINS[ChainId.ETHEREUM_SEPOLIA].blockExplorerUrl}/tx/${txHash}`, '_blank')
          },
        },
      ],
      isVisible: true,
      onClose: () => {
        setModalData((prevModalData) => ({
          ...prevModalData,
          isVisible: false,
        }))
      },
    })
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
    <div className="h-screen bg-white">
      {/* With Privacy Pools... */}
      <Description />
      {/* Header */}
      <header className="pt-14 pb-12 px-4 md:px-14 flex justify-between items-center">
        <Logo />

        <div className="flex items-center space-x-4 z-20">
          {/* {keypair && <Balance shieldedBalance={poolBalance} />} */}

          {/* {!keypair && (
            <button onClick={initializeKeypair} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
              Initialize
            </button>
          )} */}
          <CustomConnectButton shieldedBalance={poolBalance} isKeyGenerated={isKeyGenerated} />
        </div>
      </header>

      {(!isKeyGenerated || curAddress) && (
        <div className="flex justify-center pt-8">
          <div className="flex top-24 justify-center items-center absolute w-full h-full">
            <div className="absolute top-48 left-0 right-0 mx-auto z-0 bg-[#1A73E833] bg-opacity-20 filter blur-[300px] w-2/4 h-2/4"></div>
            <Image
              className="absolute top-0 left-0 right-0 mx-auto z-0"
              src={bgPattern}
              alt="background pattern"
              width={1441}
              height={1025}
              priority={true}
            />
          </div>

          <div className="bg-white rounded-[40px] shadow-[0_7px_50px_0_rgba(0,0,0,0.10)] py-8 w-full max-w-xl z-20 mb-16">
            {/* Tabs */}
            <div className="border-b border-[#F5F5F5">
              <div className="flex ml-6 sm:ml-10">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`pb-4 px-3 mr-8 box-border ${activeTab === 'deposit' ? 'border-b-2 border-blue-500' : ''} font-bold text-lg`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  disabled={isDisabled}
                  className={`pb-4 px-3 mr-8 box-border ${
                    activeTab === 'withdraw' ? 'border-b-2 border-blue-500' : ''
                  } disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg`}
                >
                  Withdraw
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  disabled={isDisabled}
                  className={`pb-4 px-3 mr-8 box-border ${
                    activeTab === 'stats' ? 'border-b-2 border-blue-500' : ''
                  } disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg`}
                >
                  Stats
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  disabled={isDisabled}
                  className={`pb-4 px-3 mr-8 box-border ${
                    activeTab === 'history' ? 'border-b-2 border-blue-500' : ''
                  } disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg`}
                >
                  History
                </button>

                {/* <button
                  onClick={() => setActiveTab('wrapEther')}
                  disabled={isDisabled}
                  className={`pb-4 px-3 mr-6 box-border ${
                    activeTab === 'wrapEther' ? 'border-b-2 border-blue-500' : ''
                  } disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg`}
                >
                  Wrap ETH
                </button> */}
              </div>
            </div>

            {!isKeyGenerated && <GeneratePool initializeKeypair={initializeKeypair} />}
            {isKeyGenerated && activeTab === 'deposit' && (
              <DepositComponent deposit={deposit} address={toChecksumAddress(connectedAddress)} />
            )}
            {/* {isKeyGenerated && activeTab === 'wrapEther' && <WrapEtherComponent wrapEther={wrapEther} address={curAddress} />} */}
            {isKeyGenerated && activeTab === 'withdraw' && (
              <WithdrawComponent
                withdrawWithRelayer={withdrawWithRelayer}
                relayers={relayers}
                logger={logger}
                shieldedBalance={poolBalance}
              />
            )}
            {isKeyGenerated && activeTab === 'stats' && <StatsComponent />}
            {isKeyGenerated && activeTab === 'history' && keypair && <HistoryComponent />}

            <ErrorModal isVisible={error !== ''} message={error} onClose={() => setError('')} />

            {modalData && <Modal {...modalData} />}
            <LoadingSpinner loadingMessage={loadingMessage} />
          </div>
        </div>
      )}
    </div>
  )
}
