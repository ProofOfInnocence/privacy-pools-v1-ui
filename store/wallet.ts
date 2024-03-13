import { APPROVAL_MESSAGE, POOL_CONTRACT } from '@/constants'
import { ArgsProof, ExtData } from '@/services/core/@types'
import { ChainId, LogLevel } from '@/types'
import { toHexString, toWei } from '@/utilities'
import { WalletClient, PublicClient } from 'viem'
import { PrivacyPool__factory as TornadoPool__factory, WETH__factory } from '@/_contracts'
import { getWrappedToken } from '@/contracts'

// export async function signStartMessage() { }

export async function transact(
  {
    walletClient,
    publicClient,
    logger,
    syncPoolBalance,
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
  console.log("You should send ", extData.extAmount);
  const { request } = await publicClient.simulateContract({
    address: toHexString(POOL_CONTRACT[ChainId.ETHEREUM_SEPOLIA]),
    abi: TornadoPool__factory.abi,
    functionName: 'transact',
    args: [args, extData],
    account: address,
    value: BigInt(extData.extAmount)
  })
  logger('Confirm transaction in your wallet', LogLevel.LOADING)
  const hash = await walletClient.writeContract(request)
  logger('Waiting for transaction ', LogLevel.LOADING)
  // let txReceipt = await publicClient.waitForTransactionReceipt({ hash })
  await syncPoolBalance()
  return hash;
}

export async function handleAllowance(
  {
    walletClient,
    publicClient,
    logger,
  }: {
    walletClient: WalletClient
    publicClient: PublicClient
    logger: (message: string, logLevel: LogLevel) => void
  },
  amount: string
) {
  // const amountInWei = toWei(amount)
  const weth = getWrappedToken(ChainId.ETHEREUM_SEPOLIA)
  const [address] = await walletClient.getAddresses()
  // const wrappedAmount = await weth.balanceOf(address)
  // console.log('Wrapped amount', wrappedAmount.toString())
  // if (wrappedAmount.lt(amountInWei)) {
  //   const rem = BigNumber.from(amountInWei).sub(wrappedAmount)
  //   const { request } = await publicClient.simulateContract({
  //     address: toHexString(weth.address),
  //     abi: WETH__factory.abi,
  //     functionName: 'deposit',
  //     args: [],
  //     account: address,
  //     value: rem.toBigInt(),
  //   })
  //   const hash = await walletClient.writeContract(request)
  //   logger('Waiting for transaction ' + hash, LogLevel.LOADING)
  //   await publicClient.waitForTransactionReceipt({ hash })
  // }
  const curAllowance = await weth.allowance(address, POOL_CONTRACT[ChainId.ETHEREUM_SEPOLIA])

  if (curAllowance.lt(toWei(amount))) {
    const { request } = await publicClient.simulateContract({
      address: toHexString(weth.address),
      abi: WETH__factory.abi,
      functionName: 'approve',
      args: [POOL_CONTRACT[ChainId.ETHEREUM_SEPOLIA], 115792089237316195423570985008687907853269984665640564039457.584007913129639935],
      account: address,
    })
    logger(APPROVAL_MESSAGE, LogLevel.LOADING)
    const hash = await walletClient.writeContract(request)
    logger('Waiting for transaction ', LogLevel.LOADING)
    await publicClient.waitForTransactionReceipt({ hash })
  }
}

export async function handleWrapEther(
  {
    walletClient,
    publicClient,
    logger,
  }: {
    walletClient: WalletClient
    publicClient: PublicClient
    logger: (message: string, logLevel: LogLevel) => void
  },
  amount: string
) {
  const weth = getWrappedToken(ChainId.ETHEREUM_SEPOLIA)
  const [address] = await walletClient.getAddresses()

  const { request } = await publicClient.simulateContract({
    address: toHexString(weth.address),
    abi: WETH__factory.abi,
    functionName: 'deposit',
    args: [],
    account: address,
    value: toWei(amount).toBigInt(),
  })
  logger('Confirm transaction in your wallet', LogLevel.LOADING)
  const hash = await walletClient.writeContract(request)
  logger('Waiting for transaction ' + hash, LogLevel.LOADING)
  await publicClient.waitForTransactionReceipt({ hash })
}
