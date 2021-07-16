const path = require('path')
const webpack = require('webpack')
const { AngularWebpackPlugin } =  require('@ngtools/webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const htmlPluginOptions = {
  hash: true,
  minify: false
}

module.exports = {
  target: 'web',
  entry: {
    index: path.resolve(__dirname, 'src/index.ts'),
    terminal: path.resolve(__dirname, 'src/terminal.ts'),
  },
  mode: process.env.DEV ? 'development' : 'production',
  context: __dirname,
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'build'),
    pathinfo: true,
    publicPath: '/static/',
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
  },
  cache: !process.env.DEV ? false : {
    type: 'filesystem',
  },
  resolve: {
    modules: [
      'src/',
      'node_modules/',
    ],
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: '@ngtools/webpack',
      },
      { test: /tabby\/app\/dist/, use: ['script-loader'] },
      {
        test: /\.pug$/,
        use: ['apply-loader', 'pug-loader'],
        include: /component\.pug/
      },
      {
        test: /\.scss$/,
        use: ['@tabby-gang/to-string-loader', 'css-loader', 'sass-loader'],
        include: /component\.scss/
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: /component\.scss/
      },
      {
        test: /\.(ttf|eot|otf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: 'asset/resource',
      },
      { test: /\.css$/, use: ['css-loader', 'sass-loader'] },
      {
        test: /\.(jpeg|png|svg)?$/,
        type: 'asset/resource',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],
  },

  plugins: [
    new AngularWebpackPlugin({
      tsconfig: 'tsconfig.main.json',
      directTemplateLoading: false,
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index'],
      ...htmlPluginOptions,
    }),
    new HtmlWebpackPlugin({
      template: './src/terminal.html',
      filename: 'terminal.html',
      chunks: ['terminal'],
      ...htmlPluginOptions,
    }),
  ],
}
