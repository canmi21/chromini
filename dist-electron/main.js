/* dist-electron/main.js */

import { ipcMain, app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development";
let mainWindow = null;
let browserWindow = null;
function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 600,
		height: 400,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "../preload/preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});
	if (isDev) {
		mainWindow.loadURL("http://localhost:5173");
	} else {
		mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	}
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}
function createBrowserWindow(url) {
	if (mainWindow) {
		mainWindow.close();
	}
	browserWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			devTools: true,
		},
	});
	browserWindow.loadURL(url);
	browserWindow.webContents.on("before-input-event", (_event, input) => {
		if (input.key === "F12") {
			browserWindow == null
				? void 0
				: browserWindow.webContents.toggleDevTools();
		}
	});
	browserWindow.on("closed", () => {
		browserWindow = null;
		app.quit();
	});
}
ipcMain.on("navigate-to-url", (_event, url) => {
	createBrowserWindow(url);
});
app.whenReady().then(() => {
	createMainWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
