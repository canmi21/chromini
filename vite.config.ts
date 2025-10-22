/* vite.config.ts */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

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
						rollupOptions: {
							external: ["electron"],
						},
					},
				},
			},
		]),
		renderer(),
	],
	base: "./",
	build: {
		outDir: "dist",
	},
	server: {
		port: 5173,
	},
});
