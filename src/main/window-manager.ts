/* src/main/window-manager.ts */

import { BrowserWindow, session } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { getConfig, saveConfig } from "./config-manager";
import { initializeWindow, cleanupWindow, createView } from "./view-manager";

// Recreate __dirname for ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep track of all open windows
const windows = new Set<BrowserWindow>();

export function createMainWindow(urlToLoad?: string) {
	const config = getConfig();
	const { width, height } = config.windowBounds;

	const newWindow = new BrowserWindow({
		width,
		height,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			webSecurity: false,
			session: session.fromPartition("persist:main"), // Use persistent session
			partition: "persist:main", // Explicit partition
		},
	});

	windows.add(newWindow);
	initializeWindow(newWindow);

	// Create the initial view for the window
	if (urlToLoad) {
		createView(urlToLoad, newWindow);
	} else {
		newWindow.setTitle("Chromini");
	}

	// Save window size on close for persistence
	newWindow.on("close", () => {
		const [width, height] = newWindow.getSize();
		const currentConfig = getConfig();
		currentConfig.windowBounds = { width, height };
		saveConfig(currentConfig);
	});

	// Clean up on close
	newWindow.on("closed", () => {
		cleanupWindow(newWindow);
		windows.delete(newWindow);
	});

	return newWindow;
}

export function getWindowCount() {
	return windows.size;
}
