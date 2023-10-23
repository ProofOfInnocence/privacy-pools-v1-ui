import { ethers } from 'ethers'

type MembershipProof = string

export function getIPFSCid(file: MembershipProof) {
  console.log('getIPFSCid is called', file)
  const cid = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(file))
  console.log('cid:', cid)
  return cid
}
