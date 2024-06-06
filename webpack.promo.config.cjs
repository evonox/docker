const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");


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
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif)$/i,
                type: 'asset/inline'
            },
        ],
    },
    devServer: {
        static: './promo-dist',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Docker Library Demo',
            template: path.resolve("./public/promo.html")
        }),
        new MiniCssExtractPlugin({
            filename: "promo-docker-ts.css"
        }),
        new CopyPlugin({
            patterns: [
                {from: "./public/code", to: "./code"},
                {from: "./public/textures", to: "./textures"}
            ]
        })
    ],

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'promo-docker-ts.js',
        path: path.resolve(__dirname, 'promo-dist'),
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