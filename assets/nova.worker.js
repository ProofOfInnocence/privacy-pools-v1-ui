/* eslint-disable @typescript-eslint/no-require-imports */
const { workerEvents } = require('../constants/worker')

async function initWorker(chainID) {
  console.log('worker init')
}

async function generate_params({ mode, pp_path, base }, [port]) {
  try {
    console.log('mode: ', mode, ', pppath: ', pp_path, 'base: ', base)
    const multiThread = await import('nova_scotia_browser')
    await multiThread.default()
    // await multiThread.initThreadPool(navigator.hardwareConcurrency)
    let pp = await multiThread.generate_params(pp_path, base)
    self.$pp = pp
    port.postMessage({ result: pp })
  } catch (e) {
    port.postMessage({ errorMessage: e.message })
  }
}

async function generate_proof({ r1cs_path, wasm_path, mode, input_path_or_str, start_path_or_str, base }, [port]) {
  try {
    const multiThread = await import('nova_scotia_browser')
    await multiThread.default()
    console.log(r1cs_path, wasm_path, mode, input_path_or_str, start_path_or_str, base)
    // await multiThread.initThreadPool(navigator.hardwareConcurrency);
    await multiThread.init_panic_hook()
    let proof = await multiThread.generate_proof(self.$pp, r1cs_path, wasm_path, input_path_or_str, start_path_or_str, base)
    self.$proof = proof
    console.log('proof: ', proof)
    port.postMessage({ result: proof })
  } catch (e) {
    port.postMessage({ errorMessage: e.message })
  }
}

const listener = ({ data, ports }) => {
  self.postMessage(data)
  switch (data.eventName) {
    case workerEvents.INIT_WORKER:
      initWorker(5)
      break
    case workerEvents.GENERATE_PP:
      generate_params(data.payload, ports)
      console.log('public parameters generated')
      break
    case workerEvents.PROVE:
      generate_proof(data.payload, ports)
      console.log('prove completed')
      break
  }
}

self.addEventListener('message', listener, false)
