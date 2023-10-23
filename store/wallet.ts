import { POOL_CONTRACT } from '@/constants'
import { ArgsProof, ExtData } from '@/services/core/@types'
import { ChainId, LogLevel } from '@/types'
import { toHexString, toWei } from '@/utilities'
import { WalletClient, PublicClient } from 'viem'
import { PrivacyPool__factory as TornadoPool__factory, WETH__factory } from '@/_contracts'
import { getWrappedToken } from '@/contracts'
import { BigNumber } from 'ethers'

export async function signStartMessage() {}

export async function transact(
  {
    walletClient,
    publicClient,
    logger,
    syncPoolBalance
  }: {
    walletClient: WalletClient
    publicClient: PublicClient
    logger: (message: string, logLevel: LogLevel) => void
    syncPoolBalance: () => Promise<void>
  },
  {
    args,
    extData,
  }: {
    args: ArgsProof
    extData: ExtData
  }
) {
  if (!walletClient) {
    throw new Error('Wallet client is null')
  }
  if (!publicClient) {
    throw new Error('Public client is null')
  }

  const [address] = await walletClient.getAddresses()
  const { request } = await publicClient.simulateContract({
    address: toHexString(POOL_CONTRACT[ChainId.ETHEREUM_GOERLI]),
    abi: TornadoPool__factory.abi,
    functionName: 'transact',
    args: [args, extData],
    account: address,
  })
  const hash = await walletClient.writeContract(request)
  logger('Waiting for transaction ' + hash, LogLevel.LOADING)
  await publicClient.waitForTransactionReceipt({ hash })
  await syncPoolBalance()

}

export async function handleAllowance(
  {
    walletClient,
    publicClient,
    logger
  }: {
    walletClient: WalletClient
    publicClient: PublicClient
    logger: (message: string, logLevel: LogLevel) => void
  },
  amount: string
) {
  const amountInWei = toWei(amount)
  const weth = getWrappedToken(ChainId.ETHEREUM_GOERLI)
  const [address] = await walletClient.getAddresses()
  const wrappedAmount = await weth.balanceOf(address)
  console.log('Wrapped amount', wrappedAmount.toString())
  if (wrappedAmount.lt(amountInWei)) {
    const rem = BigNumber.from(amountInWei).sub(wrappedAmount)
    const { request } = await publicClient.simulateContract({
      address: toHexString(weth.address),
      abi: WETH__factory.abi,
      functionName: 'deposit',
      args: [],
      account: address,
      value: rem.toBigInt(),
    })
    const hash = await walletClient.writeContract(request)
    logger('Waiting for transaction ' + hash, LogLevel.LOADING)
    await publicClient.waitForTransactionReceipt({ hash })
  }
  const curAllowance = await weth.allowance(address, POOL_CONTRACT[ChainId.ETHEREUM_GOERLI])

  if (curAllowance.lt(toWei(amount))) {
    const { request } = await publicClient.simulateContract({
      address: toHexString(weth.address),
      abi: WETH__factory.abi,
      functionName: 'approve',
      args: [POOL_CONTRACT[ChainId.ETHEREUM_GOERLI], amountInWei],
      account: address,
    })
    const hash = await walletClient.writeContract(request)
    logger('Waiting for transaction ' + hash, LogLevel.LOADING)
    await publicClient.waitForTransactionReceipt({ hash })
  }
}
