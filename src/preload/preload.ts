/* src/preload/preload.ts */

// Use require() for CommonJS compatibility.
const { contextBridge, ipcRenderer } = require("electron");
import type { IpcRendererEvent } from "electron"; // Import the type for the event

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
		// We explicitly type the event and mark it as unused with an underscore.
		ipcRenderer.on("refresh-history", (_event: IpcRendererEvent) => callback());
	},
});
