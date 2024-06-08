import typescript from '@rollup/plugin-typescript';
import cssbundle from 'rollup-plugin-css-bundle';
import terser from '@rollup/plugin-terser';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import imageInliner from 'postcss-image-inliner';
import cssnano from "cssnano";


export default {
	input: './src/docking-library.ts',
	output: [
		{
			file: './dist-esm/docking-library.esm.js',
			format: 'esm'
		}
	],
    plugins: [
		typescript(), 
		terser(), 
		cssbundle({
            transform: code => postcss([autoprefixer])
				.use(imageInliner({
					assetPaths: ["./public/images/"], 
					maxFileSize: 10240, 
				  }))
				.use(cssnano({preset: "default"}))
				.process(code, {})
		})
	]    
};
