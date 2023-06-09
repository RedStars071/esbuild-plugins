import type { ESBuildOptions } from 'vite';
import { defineConfig, type UserConfig } from 'vitest/config';

export const createVitestConfig = (options: UserConfig = {}) =>
	defineConfig({
		...options,
		test: {
			...options?.test,
			globals: true
		},
		esbuild: {
			...options?.esbuild,
			target: (options?.esbuild as ESBuildOptions | undefined)?.target ?? 'es2020'
		}
	});
