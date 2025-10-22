/* src/main/main.ts */

import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let browserWindow: BrowserWindow | null = null;

// create url input window
function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 600,
		height: 400,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			webSecurity: true,
		},
	});

	// load react app
	if (isDev) {
		mainWindow.loadURL("http://localhost:5173");
		mainWindow.webContents.openDevTools();
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
			webSecurity: true,
		},
	});

	// load user's url
	browserWindow.loadURL(url).catch((err) => {
		console.error("Failed to load URL:", err);
	});

	// register global shortcuts for dev tools
	const registerDevToolsShortcuts = () => {
		// unregister all first to avoid conflicts
		globalShortcut.unregisterAll();

		// F12 for all platforms
		globalShortcut.register("F12", () => {
			if (browserWindow && !browserWindow.isDestroyed()) {
				browserWindow.webContents.toggleDevTools();
			}
		});

		// Cmd+Option+I for macOS
		if (process.platform === "darwin") {
			globalShortcut.register("CommandOrControl+Option+I", () => {
				if (browserWindow && !browserWindow.isDestroyed()) {
					browserWindow.webContents.toggleDevTools();
				}
			});
		}
		// Ctrl+Shift+I for Windows/Linux
		else {
			globalShortcut.register("Control+Shift+I", () => {
				if (browserWindow && !browserWindow.isDestroyed()) {
					browserWindow.webContents.toggleDevTools();
				}
			});
		}
	};

	registerDevToolsShortcuts();

	browserWindow.on("closed", () => {
		// unregister shortcuts when window closes
		globalShortcut.unregisterAll();
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
	globalShortcut.unregisterAll();
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("will-quit", () => {
	globalShortcut.unregisterAll();
});
