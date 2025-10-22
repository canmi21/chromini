/* src/main/ipc-handler.ts */

import { ipcMain } from "electron";
import { createView } from "./view-manager";
import { getConfig } from "./config-manager";

export function setupIpcHandlers() {
	ipcMain.on("navigate-to-url", (_event, url: string) => {
		createView(url);
	});

	// Provide history to the welcome screen
	ipcMain.handle("get-history", () => {
		return getConfig().history;
	});
}
