# Environment Setup

This article will guide you through the basic initial setup of the environment that will be used
during the rest of chapters given by this tutorial.

We will use the TypeScript language and React as the framework to demonstrate how to easily integrate
DockerTS Library with the web frameworks. Samples with other framework integrations are also provided.

I will presume you have already installed NodeJS, best the latest LTS, and the NPM package manager.

First, we need to create a new directory for our tutorial project and initialize it.
```bash
mkdir ./test-project
cd ./test-project
npm init -y
```
The code above creates a directory and initializes a new NPM module.

We will use Webpack module bundler for our tutorial. Webpack with additional dependencies we need can
be installed using this command.
```bash
npm i -D webpack webpack-cli style-loader css-loader ts-loader typescript webpack-dev-server html-webpack-plugin
```

We create a **webpack.config.cjs** file that drives the build by Webpack. An example is given below.
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/,
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    devServer: {
        static: './dist',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Testing Project'
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};  
```
Next we need to initialize **tsconfig.json** configuration file for the Typescript to transpile. It can
be easily done by the command given below.
```bash
tsc --init
```
Next we create empty **index.ts** file in the src folder.
```bash
mkdir ./src
touch ./index.ts
```
And add this content to it.
```typescript
console.log("Hello, world");
```

Finally, we configure the NPM commands in the **package.json** file as follows:
```json
  "scripts": {
    "start": "webpack serve --open --mode development",
    "build": "webpack --mode production"
  }
```

Now, you should be able to start an empty project with **npm start** command and build its version
for production using **npm run build**.


