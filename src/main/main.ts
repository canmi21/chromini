/* src/main/main.ts */

import { app, session } from "electron";
import { setupIpcHandlers } from "./ipc-handler";
import { registerShortcuts, unregisterShortcuts } from "./shortcuts";
import { createMainWindow, getWindowCount } from "./window-manager";
import { createAppMenu } from "./app-menu";

app.whenReady().then(() => {
	const userAgent = session.defaultSession.getUserAgent();
	const chromeUserAgent = userAgent.replace(/Electron\/[\d\.]+\s/, "");
	session.defaultSession.setUserAgent(chromeUserAgent);

	setupIpcHandlers();
	registerShortcuts();
	createAppMenu();
	createMainWindow();

	app.on("activate", () => {
		if (getWindowCount() === 0) {
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
	unregisterShortcuts();
});
