/* src/main/shortcuts.ts */

import { globalShortcut } from "electron";
import {
	previousView,
	nextView,
	closeActiveView,
	goBack,
	goForward,
	reloadActiveView,
	toggleFullScreen,
	toggleActiveViewDevTools,
} from "./view-manager";
import { createMainWindow } from "./window-manager";

export function registerShortcuts() {
	globalShortcut.unregisterAll();

	// Window and Tab Management
	globalShortcut.register("F1", () => createMainWindow()); // F1 for a new empty window
	globalShortcut.register("F2", previousView);
	globalShortcut.register("F3", nextView);
	globalShortcut.register("F4", closeActiveView);

	// View Actions
	globalShortcut.register("F5", reloadActiveView);
	globalShortcut.register("F11", toggleFullScreen);
	globalShortcut.register("F12", toggleActiveViewDevTools);

	// Browser Navigation
	globalShortcut.register("CommandOrControl+[", goBack);
	globalShortcut.register("CommandOrControl+]", goForward);
	globalShortcut.register("Alt+Left", goBack);
	globalShortcut.register("Alt+Right", goForward);

	// Standard DevTools
	globalShortcut.register("CommandOrControl+Shift+I", toggleActiveViewDevTools);
}

export function unregisterShortcuts() {
	globalShortcut.unregisterAll();
}
