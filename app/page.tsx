'use client'

import { Keypair, Utxo, createTransactionData, getProvider, utxoFactory, workerProvider } from '@/services'
import { ChainId } from '@/types'
import { toWei } from 'web3-utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContractWrite, usePrepareContractWrite, usePublicClient, useSignMessage, useWalletClient } from 'wagmi'
import { BG_ZERO, POOL_CONTRACT, SIGN_MESSAGE } from '@/constants'
import { useEffect, useState } from 'react'
import { encodeTransactData, generatePrivateKeyFromEntropy, toChecksumAddress, toHexString } from '@/utilities'
import { BaseError, ContractFunctionRevertedError, numberToHex, toRlp } from 'viem'
import { UnspentUtxoData } from '@/services/utxoService/@types'
import { BigNumber } from 'ethers'

import { ArgsProof, ExtData } from '@/services/core/@types'
import axios from 'axios'
import DepositComponent from '@/components/Deposit'
import WithdrawComponent from '@/components/Withdraw'
import Logo from '@/components/Logo'
import { RelayerInfo } from '@/types'
import Balance from '@/components/Balance'
import { getWrappedToken } from '@/contracts'
import { PrivacyPool__factory as TornadoPool__factory, WETH__factory } from '@/_contracts'

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

async function prepareTransaction({
  keypair,
  amount,
  address,
  fee = BG_ZERO,
  relayer = BG_ZERO,
  recipient = BG_ZERO,
}: {
  keypair: Keypair
  amount: BigNumber
  address: string
  fee?: BigNumber
  relayer?: string | BigNumber
  recipient?: string | BigNumber
}) {
  try {
    // console.log("AAGAGSDVAJGHSDJHASHJFVADHJKGFJVBGKVJAKBJKJK")
    // console.log('Amount:', amount.toString())
    // console.log('Fee:', fee.toString())
    // // const etherAmount = BigNumber.from(toWei(amount))
    // const amountWithFee = amount.sub(fee)
    // console.log('Amount with fee:', amountWithFee.toString())
    // const etherAmount = toWei(amount)
    const amountWithFee = amount.add(fee)

    const { unspentUtxo, totalAmount } = await getUtxoFromKeypair({
      keypair,
      accountAddress: address,
      withCache: true,
    })
    console.log('Total amount:', totalAmount.toString())

    // let outputAmount
    // if (recipient == 0) {
    //   outputAmount = BigNumber.from(amount).add(inputAmount)
    // } else {
    //   if (inputAmount.lt(BigNumber.from(amount))) {
    //     throw new Error('Not enough funds')
    //   }
    //   outputAmount = inputAmount.sub(BigNumber.from(amount))
    // }

    let outputAmount
    if (recipient == BG_ZERO) {
      outputAmount = totalAmount.add(amountWithFee)
    } else {
      if (totalAmount.lt(amountWithFee)) {
        throw new Error('Not enough funds')
      }
      outputAmount = totalAmount.sub(amountWithFee)
    }

    if (unspentUtxo.length > 2) {
      throw new Error('Too many inputs')
    }
    const outputs = [new Utxo({ amount: outputAmount, keypair })]

    const { extData, args, membershipProof } = await createTransactionData(
      {
        outputs,
        inputs: unspentUtxo.length > 2 ? unspentUtxo.slice(0, 2) : unspentUtxo,
        recipient: recipient !== BG_ZERO ? toChecksumAddress(recipient) : undefined,
        relayer: relayer !== BG_ZERO ? toChecksumAddress(relayer) : undefined,
        fee: fee,
      },
      keypair
    )

    return { extData, args, membershipProof }
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
  const [error, setError] = useState('')
  const [poolBalance, setPoolBalance] = useState(0)
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [activeTab, setActiveTab] = useState('deposit')

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
  const { data: walletClient, isError, isLoading } = useWalletClient()

  useEffect(() => {
    if (!keypair && connector != null) {
      console.log('Sign message')
      signMessage()
    }
  }, [connector])

  async function initKeypair(keypair: Keypair) {
    setKeypair(keypair)
    if (!address) {
      throw new Error('Address is null')
      return
    }
    console.log(keypair)

    const { unspentUtxo, totalAmount } = await getUtxoFromKeypair({ keypair, accountAddress: address, withCache: false })
    console.log(unspentUtxo)
    console.log(totalAmount)
    setPoolBalance(totalAmount)
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

  async function handleAllowance(amount: string) {
    const weth = getWrappedToken(ChainId.ETHEREUM_GOERLI)
    if (!address) {
      throw new Error('Address is null')
      return
    }
    // get wrapped amount
    const wrappedAmount = await weth.balanceOf(address)
    console.log('Wrapped amount', wrappedAmount.toString())
    if (wrappedAmount.lt(toWei(amount))) {
      const rem = BigNumber.from(toWei(amount)).sub(wrappedAmount)
      const { request } = await publicClient.simulateContract({
        address: toHexString(weth.address),
        abi: WETH__factory.abi,
        functionName: 'deposit',
        args: [],
        account: address,
        value: rem.toBigInt(),
      })
      console.log('Request', request)
      if (!walletClient) {
        throw new Error('Wallet client is null')
        return
      }
      const hash = await walletClient.writeContract(request)
      console.log(hash)
    }
    const curAllowance = await weth.allowance(address, POOL_CONTRACT[ChainId.ETHEREUM_GOERLI])
    console.log('Current allowance', curAllowance.toString())
    if (curAllowance.lt(toWei(amount))) {
      console.log('Approve')
      // const res = await weth.approve(POOL_CONTRACT[ChainId.ETHEREUM_GOERLI], toWei(amount))
      const { request } = await publicClient.simulateContract({
        address: toHexString(weth.address),
        abi: WETH__factory.abi,
        functionName: 'approve',
        args: [POOL_CONTRACT[ChainId.ETHEREUM_GOERLI], toWei(amount)],
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
    // wait until allowance and balance is enough
    async function isAllowanceEnough() {
      if (!address) {
        throw new Error('Address is null')
      }
      const allowance = await weth.allowance(address, POOL_CONTRACT[ChainId.ETHEREUM_GOERLI])
      console.log('Allowance', allowance.toString())
      if (allowance.lt(toWei(amount))) {
        return false
      }
      const balance = await weth.balanceOf(address)
      console.log('Balance', balance.toString())
      if (balance.lt(toWei(amount))) {
        return false
      }
      return true
    }
    // wait
    while (!(await isAllowanceEnough())) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    // const allowance = await weth.allowance(address, POOL_CONTRACT[ChainId.ETHEREUM_GOERLI])
  }

  async function deposit(amount: string) {
    if (!keypair) {
      throw new Error('Keypair is null')
      return
    }
    await handleAllowance(amount)
    if (!address) {
      throw new Error('Address is null')
      return
    }
    const { extData, args } = await prepareTransaction({
      keypair,
      amount: BigNumber.from(toWei(amount)),
      address: address,
    })
    // const output = new Utxo({ amount: toWei(amount), keypair })
    // // const input = new Utxo({ amount: toWei('0.1'), keypair })
    // const transactionInputOutputs = {
    //   outputs: [output],
    // }
    // const { extData, args } = await createTransactionData(transactionInputOutputs, keypair)

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
    const totalAmount = BigNumber.from(toWei(amount))
    // substraction fee
    // const amountWithFee = totalAmount.sub(relayer.fee)
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
    console.log('INPUT.JSON->')
    console.log(JSON.stringify(membershipProof))
    if (membershipProof) {
      const inputjson = JSON.stringify(membershipProof)
      const startjson = JSON.stringify({ step_in: [BigNumber.from(membershipProof[0].step_in).toHexString()] })
      console.log('inputjson', inputjson)
      console.log('startjson', startjson)
      await workerProvider.generate_public_parameters()
      const proof = await workerProvider.prove_membership(inputjson, startjson)
      console.log(proof)
    }
    await transact({ args, extData: newExtData })
    // await sendToRelayer(relayer.rewardAddress, { extData, args })
  }

  async function transact({ args, extData }: { args: ArgsProof; extData: ExtData }) {
    if (!walletClient) {
      throw new Error('Wallet client is null')
      return
    }

    const [address] = await walletClient.getAddresses()
    console.log('Address', address)
    console.log('Args', args)
    console.log('Ext data', extData)
    console.log('Pool contract', POOL_CONTRACT[ChainId.ETHEREUM_GOERLI])

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
        </div>
      </div>
    </div>
  )
}