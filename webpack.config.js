const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: true,
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                noEmit: false
              }
            }
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.wasm$/,
          type: 'webassembly/async',
        },
        {
          test: /\.sql$/,
          type: 'asset/source',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      fallback: {
        fs: false,
        path: false,
        crypto: false,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './public/favicon.ico',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'node_modules/sql.js/dist/sql-wasm.wasm',
            to: 'sql-wasm.wasm',
          },
          {
            from: 'public/manifest.json',
            to: 'manifest.json',
          },
          {
            from: 'public/sw.js',
            to: 'sw.js',
          },
        ],
      }),
      ...(isProduction
        ? [
            new GenerateSW({
              clientsClaim: true,
              skipWaiting: true,
              runtimeCaching: [
                {
                  urlPattern: /\.(?:png|jpg|jpeg|svg|wasm)$/,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'assets',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    },
                  },
                },
              ],
            }),
          ]
        : []),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      port: 54581,
      hot: true,
      historyApiFallback: true,
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    experiments: {
      asyncWebAssembly: true,
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};