module.exports = {
  webpack(config, options) {
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
    });
    return config;
  },
};
