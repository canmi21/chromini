/* src/main/main.ts */

import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
const tabs: BrowserWindow[] = [];
let currentTabIndex = 0;

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
		// if no tabs, quit app
		if (tabs.length === 0) {
			app.quit();
		}
	});
}

// create new tab
function createTab(url: string) {
	const tab = new BrowserWindow({
		width: 1200,
		height: 800,
		show: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			devTools: true,
			webSecurity: true,
		},
	});

	// load url
	tab.loadURL(url).catch((err) => {
		console.error("Failed to load URL:", err);
	});

	// show when ready
	tab.once("ready-to-show", () => {
		tab.show();
		tab.focus();
	});

	// handle tab close
	tab.on("closed", () => {
		const index = tabs.indexOf(tab);
		if (index > -1) {
			tabs.splice(index, 1);
		}

		// update current tab index
		if (currentTabIndex >= tabs.length) {
			currentTabIndex = Math.max(0, tabs.length - 1);
		}

		// if no tabs left, show main window or quit
		if (tabs.length === 0) {
			if (mainWindow && !mainWindow.isDestroyed()) {
				mainWindow.show();
				mainWindow.focus();
			} else {
				app.quit();
			}
		} else {
			// focus on current tab
			focusCurrentTab();
		}
	});

	tabs.push(tab);
	currentTabIndex = tabs.length - 1;

	// hide main window when first tab is created
	if (mainWindow && !mainWindow.isDestroyed()) {
		mainWindow.hide();
	}

	return tab;
}

// focus current tab
function focusCurrentTab() {
	if (tabs.length > 0 && tabs[currentTabIndex] && !tabs[currentTabIndex].isDestroyed()) {
		tabs[currentTabIndex].show();
		tabs[currentTabIndex].focus();
	}
}

// navigate to previous tab
function previousTab() {
	if (tabs.length <= 1) return;

	currentTabIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
	focusCurrentTab();
}

// navigate to next tab
function nextTab() {
	if (tabs.length <= 1) return;

	currentTabIndex = (currentTabIndex + 1) % tabs.length;
	focusCurrentTab();
}

// show main window (url input)
function showMainWindow() {
	if (!mainWindow || mainWindow.isDestroyed()) {
		createMainWindow();
	} else {
		mainWindow.show();
		mainWindow.focus();
	}
}

// reload current tab
function reloadCurrentTab() {
	if (tabs.length > 0 && tabs[currentTabIndex] && !tabs[currentTabIndex].isDestroyed()) {
		tabs[currentTabIndex].webContents.reloadIgnoringCache();
	}
}

// toggle devtools for current tab
function toggleDevTools() {
	if (tabs.length > 0 && tabs[currentTabIndex] && !tabs[currentTabIndex].isDestroyed()) {
		tabs[currentTabIndex].webContents.toggleDevTools();
	}
}

// register global shortcuts
function registerGlobalShortcuts() {
	// unregister all first
	globalShortcut.unregisterAll();

	// F1 - back to url input
	globalShortcut.register("F1", () => {
		showMainWindow();
	});

	// F2 - previous tab
	globalShortcut.register("F2", () => {
		previousTab();
	});

	// F3 - next tab
	globalShortcut.register("F3", () => {
		nextTab();
	});

	// F5 - reload current tab
	globalShortcut.register("F5", () => {
		reloadCurrentTab();
	});

	// F12 - toggle devtools
	globalShortcut.register("F12", () => {
		toggleDevTools();
	});

	// Cmd+Option+I for macOS (devtools)
	if (process.platform === "darwin") {
		globalShortcut.register("CommandOrControl+Option+I", () => {
			toggleDevTools();
		});
	}
	// Ctrl+Shift+I for Windows/Linux (devtools)
	else {
		globalShortcut.register("Control+Shift+I", () => {
			toggleDevTools();
		});
	}
}

// handle url navigation from renderer
ipcMain.on("navigate-to-url", (_event, url: string) => {
	createTab(url);
});

app.whenReady().then(() => {
	registerGlobalShortcuts();
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
