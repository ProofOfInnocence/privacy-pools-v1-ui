'use client'

import * as React from 'react'
import { RainbowKitProvider, connectorsForWallets, AvatarComponent } from '@rainbow-me/rainbowkit'
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createConfig, sepolia, WagmiConfig } from 'wagmi'
import { goerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'

// const alchemyApiKey = process.env.ALCHEMY_ID ? process.env.ALCHEMY_ID : ''

// console.log('Alchemy API Key', alchemyApiKey)

const { chains, publicClient } = configureChains([sepolia], [publicProvider()])

const demoAppInfo = {
  appName: 'Privacy Pools',
}

const connectors = connectorsForWallets([{ groupName: 'Recommended', wallets: [injectedWallet({ chains })] }])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider modalSize="compact" chains={chains} appInfo={demoAppInfo}>
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
