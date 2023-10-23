/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  webpack: (config, options) => {
    // Add worker-loader rule
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: {
        loader: 'worker-loader',
        options: {
          // You can configure the valid options here as needed
          // worker: 'sharedworker', // Example option
          publicPath: '/_next/',
        },
      },
    })

    // Configure webpack resolve and externals
    config.resolve.fallback = { fs: false, net: false, tls: false }
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    return config
  },
}

module.exports = nextConfig
