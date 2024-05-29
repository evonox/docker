const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


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
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/resource'        
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
    new CopyPlugin({
      patterns: [
        { from: "./public/images/", to: "." }
      ],
    }),    
  ],  
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].docker.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  optimization: {
    runtimeChunk: 'single',
  },  
};