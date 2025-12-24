import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "./src/index.ts",
	format: "esm",
	outDir: "./dist",
	clean: true,
	// Bundle everything - workspace packages and all dependencies
	noExternal: [/.*/],
	// Exclude only Node.js built-in modules
	external: [
		"node:*",
		"fs",
		"path",
		"crypto",
		"stream",
		"util",
		"events",
		"buffer",
		"querystring",
		"url",
		"string_decoder",
		"net",
		"tls",
		"http",
		"https",
		"zlib",
		"os",
		"child_process",
		"worker_threads",
		"perf_hooks",
		"async_hooks",
	],
});
