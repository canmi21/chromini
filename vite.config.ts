/* vite.config.ts */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import path from "path";

export default defineConfig({
	plugins: [
		react(),
		electron([
			{
				entry: "src/main/main.ts",
				vite: {
					build: {
						outDir: "dist-electron",
						rollupOptions: {
							external: ["electron"],
						},
					},
				},
			},
			{
				entry: "src/preload/preload.ts",
				onstart(options) {
					options.reload();
				},
				vite: {
					build: {
						outDir: "dist-electron",
						lib: {
							entry: "src/preload/preload.ts",
							formats: ["cjs"],
							fileName: () => "preload.js",
						},
						rollupOptions: {
							external: ["electron"],
							output: {
								format: "cjs",
							},
						},
					},
				},
			},
		]),
		renderer(),
	],
	root: "./",
	base: "./",
	build: {
		outDir: "dist",
	},
	server: {
		port: 5173,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/renderer"),
		},
	},
});
