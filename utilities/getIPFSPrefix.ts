const PREFIX_INDEX = 1
const getIPFSPrefix = () => {
  const ipfsPathRegExp = /^(\/(?:ipfs|ipns)\/[^/]+)/
  return (window.location.pathname.match(ipfsPathRegExp) ?? [])[PREFIX_INDEX] || ''
}

export { getIPFSPrefix }
