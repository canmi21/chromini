/* src/preload/preload.ts */

import { contextBridge, ipcRenderer } from "electron";

// expose api to renderer process
contextBridge.exposeInMainWorld("electronAPI", {
	navigateToUrl: (url: string) => {
		ipcRenderer.send("navigate-to-url", url);
	},
});
