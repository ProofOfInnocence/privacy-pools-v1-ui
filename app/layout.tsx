import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Privacy Pools',
  description: 'Privacy Pools V1 beta',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Script src="snarkjs.min.js" strategy="afterInteractive" />
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
