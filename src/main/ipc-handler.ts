/* src/main/ipc-handler.ts */

import { ipcMain } from "electron";
import { createView } from "./view-manager";
// V-- Import the new function
import { getConfig, removeHistoryItem } from "./config-manager";

export function setupIpcHandlers() {
	ipcMain.on("navigate-to-url", (_event, url: string) => {
		createView(url);
	});

	// Provide history to the welcome screen
	ipcMain.handle("get-history", () => {
		return getConfig().history;
	});

	// Handle request to remove a history item
	ipcMain.on("remove-history-item", (_event, url: string) => {
		removeHistoryItem(url);
	});
}
