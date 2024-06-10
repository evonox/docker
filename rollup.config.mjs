import typescript from '@rollup/plugin-typescript';
import cssbundle from 'rollup-plugin-css-bundle';
import terser from '@rollup/plugin-terser';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import imageInliner from 'postcss-image-inliner';
import cssnano from "cssnano";
import fs from "fs";
import _ from "lodash-es";
import dtsBundle from 'rollup-plugin-dts-bundle';

let typescriptOptions = JSON.parse(fs.readFileSync("./tsconfig.json").toString());
typescriptOptions = _.defaultsDeep({}, typescriptOptions, {
	compilerOptions: {
		declaration: true,
		declarationDir: "./typings"
	}
});


export default {
	input: './src/docking-library.ts',
	output: [
		{
			file: './dist-esm/docking-library.esm.js',
			format: 'esm'
		}
	],
    plugins: [
		cssbundle({
            transform: code => postcss([autoprefixer])
				.use(imageInliner({
					assetPaths: ["./public/images/"], 
					maxFileSize: 10240, 
				  }))
				.use(cssnano({preset: "default"}))
				.process(code, {})
		}),
		typescript(typescriptOptions), 
		terser(),
		dtsBundle({
			bundle: {
				name: 'docker-ts',
				main: './dist-esm/typings/src/docking-library.d.ts',
				out: '../../docking-library.d.ts',
				exclude: /\.css$/
			},
			deleteOnComplete: ['./dist-esm/typings']
		})		
	]    
};
