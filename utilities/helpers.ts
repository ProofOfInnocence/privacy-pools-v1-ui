import { numbers } from '@/constants/worker'

const ZERO_ELEMENT = 0
export function getBatches<T>(array: T[], batchSize: number) {
  const batches = []
  while (array.length) {
    batches.push(array.splice(ZERO_ELEMENT, batchSize))
  }
  return batches
}

export function getBlocksBatches(fromBlock: number, toBlock: number, batchesCount: number): Array<[number, number]> {
  const interval = toBlock - fromBlock // < 200000

  const batchesSize = Math.ceil(interval / batchesCount)

  return Array.from({ length: batchesCount }, (_, index) => {
    const from = fromBlock + batchesSize * index
    let to = from + batchesSize - numbers.ONE
    if (index + numbers.ONE === batchesCount) {
      to = toBlock
    }
    return [from > to ? to : from, to > toBlock ? toBlock : to]
  })
}

export async function sleep(ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms))
}

export function isAmount(amount: number | string) {
  return amount && Number(amount)
}

type OperationCheckerInput = {
  checker: boolean
  isRelayer: boolean
  additionalCondition: boolean
}

export function getOperationChecker({ checker, isRelayer, additionalCondition }: OperationCheckerInput) {
  if (additionalCondition) {
    return checker && !isRelayer
  }
  return checker
}

export function getIsWhitelistedDomain() {
  const domainWhiteList = ['localhost:3000']

  if (window.location.host.includes('privacy-pools-v1-demo.netlify.app')) {
    return true
  }
  return domainWhiteList.includes(window.location.host)
}

export function controlledPromise<T>(promise: Promise<T>) {
  let _reject: (error: Error) => void
  let _resolve: (value: T | PromiseLike<T>) => void

  const _promise = new Promise<T>((resolve, reject) => {
    _reject = reject
    _resolve = resolve
    promise.then(resolve).catch(reject)
  })

  return {
    promise: _promise,
    // @ts-expect-error because
    resolve: _resolve,
    // @ts-expect-error because
    reject: _reject,
  }
}

export function toHexString(value: string): `0x${string}` {
  // Check if the string already starts with "0x"
  if (value.startsWith('0x')) {
    return value as `0x${string}` // If it does, return it as is
  } else {
    return `0x${value}` // If it doesn't, add "0x" and return
  }
}
