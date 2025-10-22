/* src/main/ipc-handler.ts */

import { ipcMain, BrowserWindow } from "electron";
import { createView } from "./view-manager";
import { getConfig, removeHistoryItem } from "./config-manager";

export function setupIpcHandlers() {
	ipcMain.on("navigate-to-url", (_event, url: string) => {
		// Find the window that sent the request and create the view in it
		const focusedWindow = BrowserWindow.getFocusedWindow();
		if (focusedWindow) {
			createView(url, focusedWindow);
		}
	});

	ipcMain.handle("get-history", () => {
		return getConfig().history;
	});

	ipcMain.on("remove-history-item", (_event, url: string) => {
		removeHistoryItem(url);
	});
}
