const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
  entry: './promo/index.ts',
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
    static: './promo',
  }, 
  plugins: [
    new HtmlWebpackPlugin({
        title: 'Docker Library Demo',
        template: path.resolve("./public/promo.html")
    }),
    new MiniCssExtractPlugin({
        filename: "promo-docker-ts.css"
    })
  ],  

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'promo-docker-ts.js',
    path: path.resolve(__dirname, 'promo'),
    clean: true,
    iife: true
  },
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.cssnanoMinify        
      }),
    ],

  },  
};