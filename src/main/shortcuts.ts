/* src/main/shortcuts.ts */

import { globalShortcut } from "electron";
import {
	showWelcomeView,
	previousView,
	nextView,
	reloadActiveView,
	toggleActiveViewDevTools,
} from "./view-manager";

export function registerShortcuts() {
	globalShortcut.unregisterAll();

	globalShortcut.register("F1", showWelcomeView);
	globalShortcut.register("F2", previousView);
	globalShortcut.register("F3", nextView);
	globalShortcut.register("F5", reloadActiveView);
	globalShortcut.register("F12", toggleActiveViewDevTools);

	// Standard DevTools shortcuts
	globalShortcut.register(
		"CommandOrControl+Option+I",
		toggleActiveViewDevTools
	);
	globalShortcut.register("Control+Shift+I", toggleActiveViewDevTools);
}

export function unregisterShortcuts() {
	globalShortcut.unregisterAll();
}
