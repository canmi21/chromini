/* src/main/window-manager.ts */

import { BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { getConfig, saveConfig } from "./config-manager";
import {
	createWelcomeView,
	createView,
	destroyViewsForWindow,
} from "./view-manager";

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
			webSecurity: false, // Disables same-origin policy
		},
	});

	newWindow.setTitle("Chromini");
	windows.add(newWindow);

	// Create the initial view for the window
	if (urlToLoad) {
		createView(urlToLoad, newWindow);
	} else {
		createWelcomeView(newWindow);
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
		destroyViewsForWindow(newWindow);
		windows.delete(newWindow);
	});

	return newWindow;
}

export function getWindowCount() {
	return windows.size;
}
