import webpack from 'webpack';
import 'webpack-dev-server';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const exclude = [/node_modules/];

const pathGet = (index = 0, fragment = '') =>
  path.join(process.cwd(), ['source', 'target'][index], fragment);

/** @type {webpack.Configuration} */
export default {
  entry: pathGet(),
  output: { path: pathGet(1), filename: '[name].js', publicPath: '/' },
  plugins: [
    new HtmlWebpackPlugin({ template: pathGet(undefined, 'index.html') }),
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: /** @type {CopyWebpackPlugin.Pattern[]} */ (
        ['asset'].map((fragment) => ({
          ...Object.fromEntries(
            ['from', 'to'].map((key, index) => [key, pathGet(index, fragment)])
          ),
          noErrorOnMissing: true
        }))
      )
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude,
        resolve: { fullySpecified: false },
        use: ['babel-loader']
      },
      {
        test: /\.scss$/,
        exclude,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'global',
                namedExport: false,
                exportLocalsConvention: 'as-is'
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                quietDeps: true,
                silenceDeprecations: ['import']
              }
            }
          }
        ]
      }
    ]
  },
  devServer: { hot: true, liveReload: true, historyApiFallback: true },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: { test: exclude[0], name: 'vendor', enforce: true }
      }
    }
  },
  resolve: {
    alias: {
      'react-reconciler/constants': 'react-reconciler/constants.js'
    }
  }
};
