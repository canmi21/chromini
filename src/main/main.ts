/* src/main/main.ts */

import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { getConfig, saveConfig, CACHE_PATH } from "./config-manager";
import { setMainWindow, createWelcomeView, destroyViews } from "./view-manager";
import { setupIpcHandlers } from "./ipc-handler";
import { registerShortcuts, unregisterShortcuts } from "./shortcuts";

// Recreate __dirname for ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set persistent cache path before app is ready
app.setPath("userData", CACHE_PATH);

function createMainWindow() {
	const config = getConfig();
	const { width, height } = config.windowBounds;

	const mainWindow = new BrowserWindow({
		width,
		height,
		webPreferences: {
			// Now __dirname is correctly defined here
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	setMainWindow(mainWindow);
	createWelcomeView();

	// Save window size on close for persistence
	mainWindow.on("close", () => {
		const [width, height] = mainWindow.getSize();
		const currentConfig = getConfig();
		currentConfig.windowBounds = { width, height };
		saveConfig(currentConfig);
	});

	// Clean up views when window is closed
	mainWindow.on("closed", () => {
		destroyViews();
	});
}

app.whenReady().then(() => {
	setupIpcHandlers();
	registerShortcuts();
	createMainWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("will-quit", () => {
	// Unregister all shortcuts on quit
	unregisterShortcuts();
});