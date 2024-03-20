import { BG_ZERO } from "@/constants"
import { Keypair, Utxo, createMembershipProof, createTransactionData, utxoFactory } from "@/services"
import { UnspentUtxoData } from "@/services/utxoService/@types"
import { ChainId, LoggerType } from "@/types"
import { toChecksumAddress } from "@/utilities"
import { BigNumber } from "ethers"

export async function getUtxoFromKeypair({
  keypair,
  accountAddress,
  withCache = false,
}: {
  keypair: Keypair
  accountAddress: string
  withCache: boolean
}) {
  try {
    const utxoService = utxoFactory.getService(ChainId.ETHEREUM_SEPOLIA, accountAddress)
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

export async function prepareMembershipProof({
  keypair,
  address,
  membershipProofOption,
}: {
  keypair: Keypair,
  address: string,
  membershipProofOption: number
}, logger: LoggerType) {
  try {
    const { unspentUtxo, totalAmount } = await getUtxoFromKeypair({
      keypair,
      accountAddress: address,
      withCache: true,
    })
    if (unspentUtxo.length > 2) {
      throw new Error('Too many inputs')
    }


    const { membershipProof, membershipProofURI, secondOutputBlinding } = await createMembershipProof(
      {
        inputs: unspentUtxo.length > 2 ? unspentUtxo.slice(0, 2) : unspentUtxo,
      },
      membershipProofOption,
      keypair,
      logger
    )

    return { membershipProof, membershipProofURI, secondOutputBlinding }
  } catch (err) {
    throw new Error(err.message)
  }
}

export async function prepareTransaction({
  keypair,
  amount,
  address,
  fee = BG_ZERO,
  relayer = BG_ZERO,
  recipient = BG_ZERO,
  membershipProofURI = '',
  secondOutputBlinding = '',
}: {
  keypair: Keypair
  amount: BigNumber
  address: string
  fee?: BigNumber
  relayer?: string | BigNumber
  recipient?: string | BigNumber
  membershipProofURI?: string
  secondOutputBlinding?: string
}, logger: LoggerType) {
  try {
    const amountWithFee = amount.add(fee)

    const { unspentUtxo, totalAmount } = await getUtxoFromKeypair({
      keypair,
      accountAddress: address,
      withCache: true,
    })
    console.log('Total amount:', totalAmount.toString())

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

    const { extData, args } = await createTransactionData(
      {
        outputs,
        inputs: unspentUtxo.length > 2 ? unspentUtxo.slice(0, 2) : unspentUtxo,
        recipient: recipient !== BG_ZERO ? toChecksumAddress(recipient) : undefined,
        relayer: relayer !== BG_ZERO ? toChecksumAddress(relayer) : undefined,
        fee: fee,
        membershipProofURI: membershipProofURI,
        secondOutputBlinding: secondOutputBlinding,
      },
      keypair,
      logger
    )

    return { extData, args }
  } catch (err) {
    throw new Error(err.message)
  }
}