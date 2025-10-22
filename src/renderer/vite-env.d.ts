/* src/renderer/vite-env.d.ts */

/// <reference types="vite/client" />

declare module "*.css";

interface Window {
	// expose in the `electron/preload/index.ts`
	ipcRenderer: import("electron").IpcRenderer;
}
