import { ethers } from 'ethers'

import { Networkish } from '@ethersproject/networks'
import { ConnectionInfo, fetchJson } from '@ethersproject/web'

import { numbers } from '@/constants/worker'

const defaultRetryAttempt = 0

type CustomError = {
  data?: never | undefined
  code?: number | undefined
  message?: string | undefined
}
export class ExtendedProvider extends ethers.providers.StaticJsonRpcProvider {
  public fallbackRpcs?: string[]
  public constructor(url?: ConnectionInfo | string, network?: Networkish, fallbackRpcs?: string[]) {
    super(url, network)
    this.fallbackRpcs = fallbackRpcs
  }

  // @ts-expect-error
  public async send(method: string, params: never[], retryAttempt = defaultRetryAttempt) {
    try {
      return await super.send(method, params)
    } catch (err) {
      if (!retryAttempt) {
        const TIME_OUT = 3000

        await this.sleep(TIME_OUT)

        if (this.fallbackRpcs) {
          return await this.fallbackSend(method, params, this.fallbackRpcs)
        }
        return this.send(method, params, ++retryAttempt)
      }
      throw err
    }
  }

  // eslint-disable-next-line
  private async fallbackSend(method: string, params: never[], fallbackRpcs: string[],  retryAttempt = defaultRetryAttempt): Promise<any> {

    function getResult(payload: { error?: CustomError; result?: never }): CustomError | undefined | never {
      if (payload.error) {
        const error: CustomError = new Error(payload.error.message)
        error.code = payload.error.code
        error.data = payload.error.data
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw error
      }
      return payload.result
    }

    try {
      const request = {
        method: method,
        params: params,
        id: this._nextId + numbers.ONE,
        jsonrpc: '2.0',
      }

      const result = fetchJson({ url: fallbackRpcs[retryAttempt] }, JSON.stringify(request), getResult).then(
        (result) => result,
        (error) => {
          throw error
        },
      )

      return await result
    } catch (err) {
      retryAttempt += numbers.ONE
      if (!fallbackRpcs[retryAttempt]) {
        throw err
      } else {
        return await this.fallbackSend(method, params, fallbackRpcs, retryAttempt)
      }
    }
  }

  private async sleep(ms: number) {
    return await new Promise((resolve) => setTimeout(resolve, ms))
  }

  // private checkRpcError(err: { data: string; code: string; message: string }) {
  //   const code = String(err?.code)
  //   const data = err.data?.toLowerCase()
  //   const message = err.message?.toLowerCase()

  //   const ERROR_DATA = 'too many concurrent request'
  //   const ERROR_MESSAGE = 'timeout'
  //   const ERROR_CODE = '-32017'

  //   return (data?.includes(ERROR_DATA) || message?.includes(ERROR_MESSAGE)) && code === ERROR_CODE
  // }
}
