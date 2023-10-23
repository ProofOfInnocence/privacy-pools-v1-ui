import { BigNumber, utils, BigNumberish, Wallet, BaseContract } from 'ethers'
import { toChecksumAddress as checksumAddress } from 'web3-utils'

import { EthEncryptedData } from 'eth-sig-util'

import { hexDataSlice } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { entropyToMnemonic } from '@ethersproject/hdnode'

import { numbers, CHAINS } from '@/constants'
import { ChainId } from '@/types'
// import { getBridgeHelper, getMulticall } from '@/contracts'
import { ArgsProof, ExtData } from '@/services/core/@types'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

export function stringToHex(str: string): string {
  return utils.hexlify(utils.toUtf8Bytes(str))
}
// eslint-disable-next-line
export function isAddress(value: any): string | false {
  try {
    if (!value.startsWith('0x')) {
      return false
    }
    return utils.getAddress(checksumAddress(value))
  } catch {
    return false
  }
}

// eslint-disable-next-line
export function toChecksumAddress(value: any): string {
  try {
    return checksumAddress(value)
  } catch {
    return ''
  }
}

export function toWei(value: string, uintName = 'ether') {
  return utils.parseUnits(String(value), uintName)
}

export function hexToNumber(hex: string) {
  return BigNumber.from(hex).toNumber()
}

export function generateAddress() {
  const RAND_BYTES = 20
  const MAX_LENGTH = 40

  return utils.getAddress(utils.hexlify(utils.randomBytes(RAND_BYTES)).substr(numbers.OX_LENGTH).padStart(MAX_LENGTH, '0'))
}

export function numberToHex(value: number | bigint | string | BigNumberish) {
  return utils.hexlify(value)
}

export function fromWei(balance: BigNumberish, unitName: string | BigNumberish | undefined = numbers.ETH_DECIMALS) {
  return utils.formatUnits(balance, unitName)
}

// const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
//   1: '',
//   5: 'goerli.',
//   10: 'optimistic.',
//   56: '',
//   69: 'kovan-optimistic.',
//   100: '',
// }

// const AMB_EXPLORER_SUFFIXES: { [chainId in ChainId]: string } = {
//   1: 'xdai',
//   56: 'bsc',
//   100: 'xdai',
// }

// export function getAmbBridgeTxLink(chainId: ChainId, data: string): string {
//   return `https://alm-${AMB_EXPLORER_SUFFIXES[chainId]}.tornado.ws/${chainId}/${data}`
// }

// export function getEtherscanLink(chainId: ChainId, data: string, type: 'transaction' | 'token' | 'address' | 'block'): string {
//   let prefix = `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io`

//   if (chainId === ChainId.BSC) {
//     prefix = CHAINS[ChainId.BSC].blockExplorerUrl
//   } else if (chainId === ChainId.XDAI) {
//     prefix = CHAINS[ChainId.XDAI].blockExplorerUrl
//   }

//   switch (type) {
//     case 'transaction': {
//       return `${prefix}/tx/${data}`
//     }
//     case 'token': {
//       return `${prefix}/token/${data}`
//     }
//     case 'block': {
//       return `${prefix}/block/${data}`
//     }
//     case 'address':
//     default: {
//       return `${prefix}/address/${data}`
//     }
//   }
// }

export function shortenAddress(address: string, chars = Number('4')): string {
  const parsed = isAddress(address)

  const SKIP_LENGTH = 42

  if (parsed === false) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return `${parsed.substring(numbers.ZERO, chars + numbers.OX_LENGTH)}...${parsed.substring(SKIP_LENGTH - chars)}`
}

const BYTES_32 = 32
const NONCE_BUF_LENGTH = 24
const EPHEM_PUBLIC_KEY_BUF_LENGTH = 56

export function packEncryptedMessage(encryptedData: EthEncryptedData) {
  const nonceBuf = Buffer.from(encryptedData.nonce, 'base64')
  const ephemPublicKeyBuf = Buffer.from(encryptedData.ephemPublicKey, 'base64')
  const ciphertextBuf = Buffer.from(encryptedData.ciphertext, 'base64')

  const messageBuff = Buffer.concat([
    Buffer.alloc(NONCE_BUF_LENGTH - nonceBuf.length),
    nonceBuf,
    Buffer.alloc(BYTES_32 - ephemPublicKeyBuf.length),
    ephemPublicKeyBuf,
    ciphertextBuf,
  ])

  return '0x' + messageBuff.toString('hex')
}

export function unpackEncryptedMessage(encryptedMessage: string) {
  if (encryptedMessage.slice(numbers.ZERO, numbers.OX_LENGTH) === '0x') {
    encryptedMessage = encryptedMessage.slice(numbers.OX_LENGTH)
  }

  const messageBuff = Buffer.from(encryptedMessage, 'hex')
  const nonceBuf = messageBuff.slice(numbers.ZERO, NONCE_BUF_LENGTH)
  const ephemPublicKeyBuf = messageBuff.slice(NONCE_BUF_LENGTH, EPHEM_PUBLIC_KEY_BUF_LENGTH)
  const ciphertextBuf = messageBuff.slice(EPHEM_PUBLIC_KEY_BUF_LENGTH)

  return {
    version: 'x25519-xsalsa20-poly1305',
    nonce: nonceBuf.toString('base64'),
    ephemPublicKey: ephemPublicKeyBuf.toString('base64'),
    ciphertext: ciphertextBuf.toString('base64'),
  }
}

export function intParser(value: number | string, multiplier: number): string {
  return String(parseInt(String(Number(value) * multiplier)))
}

export function getDecimals(num: number, limit = numbers.PRECISION) {
  if (Number.isInteger(num)) {
    return numbers.ZERO
  }

  const decimalStr = num.toString().split('.')[numbers.ONE]
  let result = decimalStr.substring(numbers.ZERO, limit)

  if (result.length > numbers.ONE && Number(result) === numbers.ZERO) {
    const MIN_PRECISION = numbers.ONE / Math.pow(numbers.TEN, limit)

    return Number(String(MIN_PRECISION).substring(numbers.ZERO, numbers.TWO))
  }

  while (result.endsWith('0')) {
    result = result.substring(numbers.ZERO, result.length - numbers.ONE)
  }

  return result
}

export function toDecimalsPlaces(value: number | string, decimals = numbers.PRECISION): string {
  if (Number(value) === numbers.ZERO) {
    return String(numbers.ZERO)
  }
  const MIN_PRECISION = numbers.ONE / Math.pow(numbers.TEN, decimals)

  if (Number(value) < MIN_PRECISION && Number(value) > numbers.ZERO) {
    return `~${MIN_PRECISION}`
  }

  const decimalsValue = getDecimals(Number(value), decimals)

  if (Number(decimalsValue) > numbers.ZERO) {
    return `${intParser(Number(value), numbers.ONE)}.${decimalsValue}`
  }
  return String(value)
}

export function increaseByPercent(number: BigNumber, percent: number) {
  const onePercent = number.div(numbers.ONE_HUNDRED)

  return number.add(onePercent.mul(percent))
}

export function integerMultiplier(): BigNumber {
  return toWei('1', 'ether')
}

export function generatePrivateKeyFromEntropy(entropy: string) {
  const hexData = hexDataSlice(keccak256(entropy), numbers.ZERO, numbers.SIX_TEEN)

  const mnemonic = entropyToMnemonic(hexData)

  return Wallet.fromMnemonic(mnemonic).privateKey
}

export function encodeTransactData({ args, extData }: { args: ArgsProof; extData: ExtData }) {
  const abi = new utils.AbiCoder()

  return abi.encode(
    [
      'tuple(bytes proof,bytes32 root,bytes32[] inputNullifiers,bytes32[2] outputCommitments,uint256 publicAmount,bytes32 extDataHash)',
      'tuple(address recipient,int256 extAmount,address relayer,uint256 fee,bytes encryptedOutput1,bytes encryptedOutput2,bool isL1Withdrawal,uint256 l1Fee)',
    ],
    [args, extData]
  )
}

// type EncodeWrapParams = {
//   address: string
//   data: string
//   chainId: L1ChainId
//   account?: { owner: string; publicKey: string }
// }

// export function encodeWrapAndRelayData({ chainId, address, data, account = undefined }: EncodeWrapParams) {
//   const contract = getBridgeHelper(chainId)

//   const isRegistration = account && 'publicKey' in account

//   const signature = isRegistration ? 'wrapAndRelayTokens(address,bytes,(address,bytes))' : 'wrapAndRelayTokens(address,bytes)'
//   const params = isRegistration ? [address, data, account] : [address, data]

//   // TODO: check signature and params
//   // const signature = 'wrapAndRelayTokens(address,bytes,(address,bytes))'
//   // const params = [
//   //   address,
//   //   data,
//   //   isRegistration
//   //     ? account
//   //     : { owner: '0x0000000000000000000000000000000000000000', publicKey: '0x0000000000000000000000000000000000000000' },
//   // ]

//   // @ts-expect-error
//   return contract.interface.encodeFunctionData(signature, params)
// }

export const bump = (gas: BigNumber, percent: number) => gas.mul(percent).div(numbers.ONE_HUNDRED).toNumber()

export const gweiToWei = (value: number) => {
  const ceilValue = Math.ceil(value)
  const integerValue = parseInt(String(ceilValue))

  return toWei(String(integerValue), 'gwei')
}

export const getMessageIdFromTransaction = (type: 'withdrawal' | 'deposit', receipt: TransactionReceipt) => {
  if (type === 'deposit') {
    return receipt.logs['2'].topics['1']
  } else {
    return receipt.logs['4'].topics['1']
  }
}

// // eslint-disable-next-line
// export const onStaticMulticall = async <C extends BaseContract, A extends any[]>(
//   chainId: ChainId,
//   calls: Array<{ contract: C; methodName: string; args: A }>
// ) => {
//   const multicall = getMulticall(chainId)

//   const params = calls.map(({ contract, methodName, args }) => ({
//     gasLimit: '0x14f6d',
//     target: contract.address,
//     callData: contract.interface.encodeFunctionData(methodName, args),
//   }))

//   return await multicall.callStatic.multicall(params)
// }
