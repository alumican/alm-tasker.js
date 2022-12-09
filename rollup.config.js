import PluginCleanup from 'rollup-plugin-cleanup';
import PluginNodeResolve from '@rollup/plugin-node-resolve';
import PluginTypescript from '@rollup/plugin-typescript';
import {terser as PluginTerser} from 'rollup-plugin-terser';

import pkg from "./package.json";

const production = process.env.BUILD === 'production';
const document = process.env.BUILD === 'document';

function getPlugins() {
	const plugins = [
		PluginTypescript({
			tsconfig: './tsconfig.' + (document ? 'doc' : 'main') + '.json',
		}),
		PluginNodeResolve({
			preferBuiltins: false,
		}),
		PluginCleanup({
			comments: 'none',
		}),
	];
	if (production) {
		plugins.push(PluginTerser());
	}
	return plugins;
}

function getOutput() {
	const output = {
		file: production ? pkg.main.replace('.js', '.min.js') : pkg.main,
		format: 'umd',
		name: pkg.config.namespace,
		extend: true,
		sourcemap: true,
	};
	if (pkg.config.externalDependencies) {
		output.globals = {};
		pkg.config.externalDependencies.map((value) => {
			output.globals[value] = value;
		});
	}
	if (!document) {
		output['banner'] = `/*! ${pkg.name} ${pkg.version} (c) ${(new Date()).getFullYear()} ${pkg.author}, licensed under the ${pkg.license}, more information ${pkg.repository.url} */`;
	}
	return output;
}

function getDefault() {
	const def = {
		input: './src/index.ts',
		output: getOutput(),
		plugins: getPlugins(),
	}
	if (pkg.config.externalDependencies) {
		def.external = pkg.config.externalDependencies;
	}
	return def;
}

export default getDefault();
