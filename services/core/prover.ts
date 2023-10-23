/* eslint-disable */
// no-magic-numbers

// @ts-expect-error
import { utils } from 'ffjavascript'

import { toFixedHex } from './utils'

async function prove(input: never, wasm: File, zkey: File) {
  try {
    const { proof } = await window.snarkjs.groth16.fullProve(utils.stringifyBigInts(input), wasm, zkey)
    return (
      '0x' +
      toFixedHex(proof.pi_a[0]).slice(2) +
      toFixedHex(proof.pi_a[1]).slice(2) +
      toFixedHex(proof.pi_b[0][1]).slice(2) +
      toFixedHex(proof.pi_b[0][0]).slice(2) +
      toFixedHex(proof.pi_b[1][1]).slice(2) +
      toFixedHex(proof.pi_b[1][0]).slice(2) +
      toFixedHex(proof.pi_c[0]).slice(2) +
      toFixedHex(proof.pi_c[1]).slice(2)
    )
  } catch (err) {
    throw new Error(err.message)
  }
}

export { prove }
