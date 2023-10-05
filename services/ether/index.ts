import { ethers } from 'ethers'
import { findReplacementTx } from 'find-replacement-tx'

import { Transaction, TransactionByHash, TransactionResult, WaitForTxReceiptParams } from '@/services/provider/@types'

import { ChainId } from '@/types'
import { numbers, RPC_LIST, RPC_WS_LIST, CHAINS, FALLBACK_RPC_LIST } from '@/constants'

import { Options } from './@types'
import { ExtendedProvider } from './ExtendedProvider'

export class Provider {
  public provider: ExtendedProvider
  private readonly chainId: ChainId

  public constructor(options: Options) {
    this.provider = new ExtendedProvider(options.url, options.chainId, options.fallbackRpcs)
    this.chainId = options.chainId
  }

  public async waitForTxReceipt({ txHash }: WaitForTxReceiptParams): Promise<Transaction> {
    try {
      const multiplier = 10
      const callRetryAttempt = 15
      const totalAttempt = callRetryAttempt * multiplier

      const startBlock = (await this.provider.getBlockNumber()) - numbers.TEN

      const getTransactionByHash = async () => {
        const tx = await this.provider.getTransaction(txHash)
        return tx
      }

      const transaction = await this.repeatRequestUntilResult<TransactionByHash>(getTransactionByHash, totalAttempt)

      const findTransactionReceipt = async () => {
        let receipt = await this.provider.getTransactionReceipt(txHash)

        if (!receipt) {
          const tx = {
            nonce: transaction.nonce,
            from: transaction.from,
            to: transaction.to,
            data: transaction.data,
          }
          const foundTx = await findReplacementTx(this.provider, startBlock, tx)

          if (foundTx) {
            receipt = await this.provider.getTransactionReceipt(foundTx.hash)
          }
        }

        return receipt
      }
      const receipt = await this.repeatRequestUntilResult<TransactionResult>(findTransactionReceipt, totalAttempt)

      return Object.assign(receipt, { value: transaction.value })
    } catch (err) {
      throw new Error(`Provider method waitForTxReceipt has error: ${err.message}`)
    }
  }

  public async waitForTxConfirmations({
    txHash,
    callback,
    minConfirmation = numbers.MIN_BRIDGE_CONFIRMATION,
    attempt = numbers.ONE,
  }: WaitForTxReceiptParams): Promise<Boolean> {
    try {
      const callRetryAttempt = 150

      if (attempt === numbers.ONE) {
        const txResponse = await this.provider.getTransaction(txHash)

        await txResponse.wait(numbers.ONE)
      }

      const receipt = await this.provider.getTransactionReceipt(txHash)

      if (typeof callback === 'function' && receipt) {
        callback(receipt)
      }

      if (receipt?.confirmations >= minConfirmation) {
        return true
      } else if (attempt >= callRetryAttempt) {
        return false
      } else {
        attempt++
        await this.sleep(CHAINS[this.chainId].blockDuration)
        return await this.waitForTxConfirmations({ txHash, minConfirmation, attempt, callback })
      }
    } catch (err) {
      attempt++
      await this.sleep(CHAINS[this.chainId].blockDuration)
      return await this.waitForTxConfirmations({ txHash, minConfirmation, attempt, callback })
    }
  }

  private async sleep(ms: number) {
    return await new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async repeatRequestUntilResult<T>(
    action: CallableFunction,
    totalAttempts: number,
    retryAttempt: number = numbers.ONE,
  ): Promise<T> {
    return await new Promise((resolve, reject) => {
      const iteration = async (): Promise<void> => {
        try {
          const result = await action()

          if (!result) {
            if (retryAttempt <= totalAttempts) {
              retryAttempt++
              setTimeout(() => {
                // eslint-disable-next-line no-void
                void iteration()
              }, numbers.SECOND * retryAttempt)
            } else {
              return reject(new Error('Tx not minted'))
            }
          } else {
            resolve(result)
          }
        } catch (err) {
          reject(err)
        }
      }

      // eslint-disable-next-line no-void
      void iteration()
    })
  }
}

class Providers {
  private readonly providers: Map<ChainId, Provider> = new Map()

  public getProvider(chainId: ChainId): Provider {
    if (!this.providers.has(chainId)) {
      this.providers.set(chainId, new Provider({ url: RPC_LIST[chainId], chainId, fallbackRpcs: FALLBACK_RPC_LIST[chainId] }))
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.providers.get(chainId)!
  }
}

const providers = new Providers()

export function getProvider(chainId: ChainId): Provider {
  return providers.getProvider(chainId)
}

// @ts-expect-error
let wsProvider: ethers.providers.WebSocketProvider = null

export function getWSProvider(chainId: ChainId): ethers.providers.WebSocketProvider {
  if (!wsProvider) {
    wsProvider = new ethers.providers.WebSocketProvider(RPC_WS_LIST[chainId], chainId)
  }

  return wsProvider
}
