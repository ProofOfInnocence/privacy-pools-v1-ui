import { ethers } from 'ethers'
import { importer } from 'ipfs-unixfs-importer'
import { readFileSync } from 'fs'
import { join } from 'path'

async function hash(content: any, options?: any) {

  const block = {
    get: async (cid: any) => { throw new Error(`unexpected block API get for ${cid}`) },
    put: async () => { throw new Error('unexpected block API put') }
  }

  options = options || {}
  options.onlyHash = true

  if (typeof content === 'string') {
    content = new TextEncoder().encode(content)
  }

  let lastCid: string | undefined;
  for await (const { cid } of importer([{ content }], block, options)) {
    lastCid = cid.toString();
  }

  return `${lastCid}`
}

async function getIPFSCid(file: any) {
  console.log('getIPFSCid is called', file)
  const cid: string = (await hash(file)) as string;
  console.log('cid:', cid)
  return cid
}

async function syncReadFile(filename: string) {
  const result = readFileSync(join(__dirname, filename), 'utf-8');

  // bobby
  // hadz
  // com
  console.log(result);

  return result;
}

const fileContent = await syncReadFile('../../privacy-pools-arb/membership-proof/test/inputs.json')
const hashValue = await hash(fileContent)
console.log('hashValue: ', hashValue)





