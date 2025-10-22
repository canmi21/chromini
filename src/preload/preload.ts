/* src/preload/preload.ts */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	navigateToUrl: (url: string) => {
		ipcRenderer.send("navigate-to-url", url);
	},
});
