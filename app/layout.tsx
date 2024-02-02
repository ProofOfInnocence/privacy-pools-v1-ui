import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

import localFont from 'next/font/local'
import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from './providers'
import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

const satoshi = localFont({
  src: [
    {
      path: './satoshi-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './satoshi-regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
})

export const metadata: Metadata = {
  title: 'Privacy Pools',
  description: 'Privacy Pools V1 beta',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Script src="snarkjs.min.js" strategy="afterInteractive" />
      <body className={satoshi.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
