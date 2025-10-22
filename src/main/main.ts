/* src/main/main.ts */

import { app, session } from "electron"; // Import the 'session' module
import { setupIpcHandlers } from "./ipc-handler";
import { registerShortcuts, unregisterShortcuts } from "./shortcuts";
import { createMainWindow, getWindowCount } from "./window-manager";
import { createAppMenu } from "./app-menu";

app.whenReady().then(() => {
	// Get the default user agent string.
	const userAgent = session.defaultSession.getUserAgent();
	const chromeUserAgent = userAgent.replace(/Electron\/[\d\.]+\s/, "");
	// Set the modified user agent for all future requests.
	session.defaultSession.setUserAgent(chromeUserAgent);

	setupIpcHandlers();
	registerShortcuts();
	createAppMenu();
	createMainWindow();

	app.on("activate", () => {
		// On macOS, re-create a window when the dock icon is clicked
		if (getWindowCount() === 0) {
			createMainWindow();
		}
	});
});

app.on("window-all-closed", () => {
	// Quit when all windows are closed, except on macOS
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("will-quit", () => {
	// Unregister all shortcuts on quit
	unregisterShortcuts();
});
