/* src/main/main.ts */

import { app } from "electron";
import { setupIpcHandlers } from "./ipc-handler";
import { registerShortcuts, unregisterShortcuts } from "./shortcuts";
import { createMainWindow, getWindowCount } from "./window-manager";
import { createAppMenu } from "./app-menu"; // Import the new menu creator

app.whenReady().then(() => {
	setupIpcHandlers();
	registerShortcuts();
	createAppMenu(); // Set the application menu
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
