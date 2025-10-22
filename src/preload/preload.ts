/* src/preload/preload.ts */

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
	navigateToUrl: (url: string) => {
		ipcRenderer.send("navigate-to-url", url);
	},
	getHistory: (): Promise<any[]> => {
		return ipcRenderer.invoke("get-history");
	},
	removeHistoryItem: (url: string) => {
		ipcRenderer.send("remove-history-item", url);
	},
	// Listens for an event from main process to refresh history
	onRefreshHistory: (callback: () => void) => {
		ipcRenderer.on("refresh-history", callback);
	},
});
