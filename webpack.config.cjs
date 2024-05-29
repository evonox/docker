const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/,
          /\.test\.ts$/
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader,'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/inline'        
      },      
    ],
  },
  devServer: {
    static: './dist',
  }, 
  plugins: [
    new HtmlWebpackPlugin({
        title: 'Docker Library',
        template: path.resolve("./public/index.html")
    }),
    new MiniCssExtractPlugin({
        filename: "[name].docker.css"
    })
  ],  

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].docker.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    iife: true
  },
  optimization: {
    // runtimeChunk: 'single',
    minimizer: [
      `...`,
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.cssnanoMinify        
      }),
    ],

  },  
};