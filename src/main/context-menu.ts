/* src/main/context-menu.ts */

import { Menu, WebContents, BrowserWindow } from "electron";
import { createMainWindow } from "./window-manager";
import { createView } from "./view-manager";

export function createContextMenu(webContents: WebContents) {
	webContents.on("context-menu", (_event, params) => {
		const parentWindow = BrowserWindow.fromWebContents(webContents);
		const menu = Menu.buildFromTemplate([
			// Manual implementation for "Back"
			{
				label: "Back",
				enabled: webContents.canGoBack(),
				click: () => {
					if (webContents.canGoBack()) {
						webContents.goBack();
					}
				},
			},
			// Manual implementation for "Forward"
			{
				label: "Forward",
				enabled: webContents.canGoForward(),
				click: () => {
					if (webContents.canGoForward()) {
						webContents.goForward();
					}
				},
			},
			{
				label: "Reload",
				click: () => webContents.reload(),
			},
			{ type: "separator" },
			{
				label: "Open Link in New Tab",
				visible: !!params.linkURL,
				click: () => {
					if (params.linkURL && parentWindow) {
						createView(params.linkURL, parentWindow);
					}
				},
			},
			{
				label: "Open Link in New Window",
				visible: !!params.linkURL,
				click: () => {
					if (params.linkURL) {
						createMainWindow(params.linkURL);
					}
				},
			},
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			{ type: "separator" },
			// Manual implementation for "Toggle Developer Tools"
			{
				label: "Inspect",
				click: () => webContents.toggleDevTools(),
			},
			// Manual implementation for "Toggle Full Screen"
			{
				label: "Toggle Full Screen",
				click: () => {
					if (parentWindow) {
						parentWindow.setFullScreen(!parentWindow.isFullScreen());
					}
				},
			},
		]);
		menu.popup();
	});
}

// New context menu for the welcome page
export function createWelcomeContextMenu(webContents: WebContents) {
	webContents.on("context-menu", (_event) => {
		const menu = Menu.buildFromTemplate([
			{
				label: "Reload",
				click: () => webContents.reload(),
			},
			{ type: "separator" },
			{
				label: "Inspect",
				click: () => webContents.toggleDevTools(),
			},
		]);
		menu.popup();
	});
}
