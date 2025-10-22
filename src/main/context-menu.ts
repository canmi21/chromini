/* src/main/context-menu.ts */

import { Menu, WebContents } from "electron";
import { createView } from "./view-manager";

export function createContextMenu(webContents: WebContents) {
	webContents.on("context-menu", (_event, params) => {
		const menu = Menu.buildFromTemplate([
			{
				label: "Back",
				enabled: webContents.canGoBack(),
				click: () => webContents.goBack(),
			},
			{
				label: "Forward",
				enabled: webContents.canGoForward(),
				click: () => webContents.goForward(),
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
					if (params.linkURL) {
						createView(params.linkURL);
					}
				},
			},
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			{ type: "separator" },
			{
				label: "Inspect Element",
				click: () => webContents.inspectElement(params.x, params.y),
			},
		]);
		menu.popup();
	});
}
