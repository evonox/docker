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
    // Headers to allow more precise high-resolution clock measuring
    // URL: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  }, 
  plugins: [
    new HtmlWebpackPlugin({
        title: 'Docker Library',
        template: path.resolve("./public/index.html")
    }),
    new MiniCssExtractPlugin({
        filename: "docker-ts.css"
    })
  ],  

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  experiments: {
    outputModule: true,
  },  
  output: {
    filename: 'docker-ts.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: {
      type: "module"
    }
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