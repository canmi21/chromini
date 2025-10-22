/* src/main/context-menu.ts */

import { Menu, WebContents, BrowserWindow } from "electron";
import { createMainWindow } from "./window-manager";
import { createView, closeActiveView } from "./view-manager";

export function createContextMenu(webContents: WebContents) {
	webContents.on("context-menu", (_event, params) => {
		const parentWindow = BrowserWindow.fromWebContents(webContents);
		const menu = Menu.buildFromTemplate([
			// Navigation controls
			{
				label: "Back",
				enabled: webContents.canGoBack(),
				click: () => {
					if (webContents.canGoBack()) {
						webContents.goBack();
					}
				},
			},
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
				accelerator: "CmdOrCtrl+R",
				click: () => webContents.reload(),
			},
			{ type: "separator" },
			// Link-specific actions
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
			// Standard edit controls
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			{ type: "separator" },
			// Page, window, and developer actions
			{
				label: "Move to New Window",
				visible: !params.linkURL, // Only show when not clicking a link
				click: () => {
					const currentURL = webContents.getURL();
					if (currentURL) {
						createMainWindow(currentURL);
						closeActiveView(); // Close the original tab
					}
				},
			},
			{
				label: "Toggle Full Screen",
				accelerator: "F11",
				click: () => {
					if (parentWindow) {
						parentWindow.setFullScreen(!parentWindow.isFullScreen());
					}
				},
			},
			{ type: "separator" },
			{
				label: "Developer Tools",
				accelerator: "CmdOrCtrl+Shift+I",
				click: () => webContents.toggleDevTools(),
			},
		]);
		menu.popup();
	});
}

// Context menu for the welcome page
export function createWelcomeContextMenu(webContents: WebContents) {
	webContents.on("context-menu", (_event) => {
		const menu = Menu.buildFromTemplate([
			{
				label: "Reload",
				accelerator: "CmdOrCtrl+R",
				click: () => webContents.reload(),
			},
			{
				label: "New Window",
				accelerator: "CmdOrCtrl+N",
				click: () => createMainWindow(),
			},
			{ type: "separator" },
			{
				label: "Developer Tools",
				accelerator: "CmdOrCtrl+Shift+I",
				click: () => webContents.toggleDevTools(),
			},
		]);
		menu.popup();
	});
}
