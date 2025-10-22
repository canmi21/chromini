/* dist-electron/preload.js */

import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
	navigateToUrl: (url) => {
		ipcRenderer.send("navigate-to-url", url);
	},
});
