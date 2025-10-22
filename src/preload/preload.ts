/* src/preload/preload.ts */

const { contextBridge, ipcRenderer } = require("electron");

// expose api to renderer process
contextBridge.exposeInMainWorld("electronAPI", {
	navigateToUrl: (url: string) => {
		ipcRenderer.send("navigate-to-url", url);
	},
});
