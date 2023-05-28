import { relative, resolve as resolveDir, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Options } from "tsup";

export const createTsupConfig = (options: Options = {}) =>
	defineConfig({
		clean: true,
		dts: true,
		entry: ["src/index.ts"],
		format: options?.format ?? ["esm", "cjs"],
		minify: options?.minify ?? false,
		skipNodeModulesBundle: true,
		sourcemap: true,
		target: "es2021",
		tsconfig: relative(
			dirname(fileURLToPath(import.meta.url)),
			resolveDir(process.cwd(), "src", "tsconfig.json")
		),
		keepNames: true,
		treeshake: true,
		...options,
	});
