/* src/main/app-menu.ts */

import { Menu, MenuItemConstructorOptions } from "electron";
import { createMainWindow } from "./window-manager";
import {
	reloadActiveView,
	toggleFullScreen,
	toggleActiveViewDevTools,
} from "./view-manager";

// This function creates and sets the main application menu.
export function createAppMenu() {
	const template: MenuItemConstructorOptions[] = [
		{
			label: "File",
			submenu: [
				{
					label: "New Window",
					accelerator: "CommandOrControl+N",
					click: () => {
						createMainWindow();
					},
				},
				{ type: "separator" },
				process.platform === "darwin" ? { role: "close" } : { role: "quit" },
			],
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
			],
		},
		{
			label: "View",
			submenu: [
				{
					label: "Reload",
					accelerator: "CommandOrControl+R", // Maps to F5 as well
					click: () => reloadActiveView(),
				},
				{ type: "separator" },
				{
					label: "Toggle Full Screen",
					accelerator: "F11",
					click: () => toggleFullScreen(),
				},
				{
					label: "Toggle Developer Tools",
					accelerator: "CommandOrControl+Shift+I", // Maps to F12 as well
					click: () => toggleActiveViewDevTools(),
				},
			],
		},
	];

	// Add a specific macOS "App" menu
	if (process.platform === "darwin") {
		template.unshift({
			label: "Chromini",
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{ role: "services" },
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideOthers" },
				{ role: "unhide" },
				{ type: "separator" },
				{ role: "quit" },
			],
		});
	}

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}
