import { ChainId } from '@/types'
import { numbers, RPC_LIST } from '@/constants'
import { getProvider } from '@/services'
import { gweiToWei, bump } from '@/utilities'

const SECONDS = 3
const TEN_SECOND = SECONDS * numbers?.SECOND

const percentBump = {
  INSTANT: 150,
  FAST: 130,
  STANDARD: 85,
  LOW: 50,
}

const getGasPriceFromRpc = async (chainId: ChainId) => {
  try {
    const { provider } = getProvider(chainId)

    const current = await provider.getGasPrice()

    return {
      instant: bump(current, percentBump.INSTANT),
      fast: bump(current, percentBump.FAST),
      standard: bump(current, percentBump.STANDARD),
      low: bump(current, percentBump.LOW),
    }
  } catch (err) {
    throw new Error('getGasPriceFromRpc has error')
  }
}

export { getGasPriceFromRpc }
