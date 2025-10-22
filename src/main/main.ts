/* src/main/main.ts */

import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";

let mainWindow: BrowserWindow | null = null;
let browserWindow: BrowserWindow | null = null;

// create url input window
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

	// load react app
	if (isDev) {
		mainWindow.loadURL("http://localhost:5173");
		// open devtools in dev mode
		// mainWindow.webContents.openDevTools()
	} else {
		mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

// create browser window with webview
function createBrowserWindow(url: string) {
	// close input window
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

	// load user's url
	browserWindow.loadURL(url);

	// enable F12 dev tools
	browserWindow.webContents.on("before-input-event", (_event, input) => {
		if (input.key === "F12") {
			browserWindow?.webContents.toggleDevTools();
		}
	});

	browserWindow.on("closed", () => {
		browserWindow = null;
		app.quit();
	});
}

// handle url navigation from renderer
ipcMain.on("navigate-to-url", (_event, url: string) => {
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
