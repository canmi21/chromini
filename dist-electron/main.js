/* dist-electron/main.js */

import { app, ipcMain, BrowserWindow, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let mainWindow = null;
let browserWindow = null;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  });
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
      webSecurity: true
    }
  });
  browserWindow.loadURL(url).catch((err) => {
    console.error("Failed to load URL:", err);
  });
  const registerDevToolsShortcuts = () => {
    globalShortcut.register("F12", () => {
      if (browserWindow && !browserWindow.isDestroyed()) {
        browserWindow.webContents.toggleDevTools();
      }
    });
    if (process.platform === "darwin") {
      globalShortcut.register("Command+Option+I", () => {
        if (browserWindow && !browserWindow.isDestroyed()) {
          browserWindow.webContents.toggleDevTools();
        }
      });
    } else {
      globalShortcut.register("Control+Shift+I", () => {
        if (browserWindow && !browserWindow.isDestroyed()) {
          browserWindow.webContents.toggleDevTools();
        }
      });
    }
  };
  registerDevToolsShortcuts();
  browserWindow.on("closed", () => {
    globalShortcut.unregisterAll();
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
  globalShortcut.unregisterAll();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
