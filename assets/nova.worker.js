/* eslint-disable @typescript-eslint/no-require-imports */
const { workerEvents } = require('../constants/worker')

async function initWorker(chainID) {
  console.log("worker init")
} 

async function generate_params({mode, pp_path, base}, [port]) {
  console.log("generate parameters - 0")
  console.log("mode: ", mode, ", pppath: ", pp_path)
  const multiThread = await import("nova_scotia_browser");
  console.log("generate parameters - 1")
  await multiThread.default();
  console.log("generate parameters - 2")
  //await multiThread.initThreadPool(navigator.hardwareConcurrency);
  
  let pp = await multiThread.generate_params(mode, pp_path, base);
  self.$pp = pp;
  port.postMessage({ result: pp })
}

async function generate_proof({r1cs_path, wasm_path, input_path, start_path, base}, [port]) {
  console.log("generate proof - 0")
  const multiThread = await import("nova_scotia_browser");
  console.log("generate proof - 1")
  await multiThread.default();
  console.log("generate proof - 2")
  //await multiThread.initThreadPool(navigator.hardwareConcurrency);

  let proof = await multiThread.generate_proof(self.$pp, r1cs_path, wasm_path, input_path, start_path, base)
  console.log("generate proof - 3", proof)
  self.$proof = proof
  port.postMessage({ result: proof })
}

async function verify_proof({start_path, base}, [port]) {
  console.log("verify proof - 0")
  const multiThread = await import("nova_scotia_browser");
  console.log("verify proof - 1")
  await multiThread.default();
  console.log("verify proof - 2")
  //await multiThread.initThreadPool(navigator.hardwareConcurrency);

  let correct = await multiThread.verify_compressed_proof(self.$pp, self.$proof, start_path, base);
  self.$correct = correct
  port.postMessage({ result: correct })
}

const listener = ({ data, ports }) => {
  self.postMessage(data)
  switch (data.eventName) {
    case workerEvents.INIT_WORKER:
      initWorker(5)
      break
    case workerEvents.GENERATE_PP:
      console.log("genpp event occurred")
      console.log("data payload", data.payload)
      generate_params(data.payload, ports)
      //console.log("pp", pp)
      console.log("pp generated")
      break
    case workerEvents.PROVE:
      console.log("prove event occurred")
      console.log("data payload", data.payload)
      //generate_params(data.payload, ports)
      generate_proof(data.payload, ports)
      //console.log("pp", pp)
      console.log("prove done")
      break
    case workerEvents.VERIFY:
      console.log("verify event occurred")
      console.log("data payload", data.payload)
      //generate_params(data.payload, ports)
      verify_proof(data.payload, ports)
      //console.log("pp", pp)
      console.log("verify done")
      break
  }
}
//generate_params(2, "poi-pp.cbor", "http://127.0.0.1:3001")
self.addEventListener('message', listener, false)
