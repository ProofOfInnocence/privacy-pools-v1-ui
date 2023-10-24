// @ts-expect-error
import Hash from 'ipfs-only-hash';

type MembershipProof = string

export async function getIPFSCid(file: MembershipProof) {
  return await Hash.of(file)
}
