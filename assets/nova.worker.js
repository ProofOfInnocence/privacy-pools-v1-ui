/* eslint-disable @typescript-eslint/no-require-imports */
const { workerEvents } = require('../constants/worker')

async function initWorker(chainID) {
  console.log("worker init")
} 

async function generate_params(mode, pp_path, port) {
  console.log("generate parameters - 0")
  console.log("mode: ", mode, ", pppath: ", pp_path)
  const multiThread = await import("nova_scotia_browser");
  console.log("generate parameters - 1")
  await multiThread.default();
  console.log("generate parameters - 2")
  //await multiThread.initThreadPool(navigator.hardwareConcurrency);
  
  return await multiThread.generate_params(mode, pp_path, port);
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
      generate_params(2, "poi-pp.cbor", "http://127.0.0.1:3001")
      //console.log(a)
      console.log("pp generated")
      break
  }
}
//generate_params(2, "poi-pp.cbor", "http://127.0.0.1:3001")
self.addEventListener('message', listener, false)
