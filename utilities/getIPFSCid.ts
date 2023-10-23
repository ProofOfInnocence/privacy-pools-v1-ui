import { ethers } from 'ethers'

type MembershipProof = string

export function getIPFSCid(file: MembershipProof) {
  const cid = ethers.utils.keccak256(file)
  return cid
}
