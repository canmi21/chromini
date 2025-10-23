/* src/main/shortcuts.ts */

import { globalShortcut, BrowserWindow } from "electron";
import {
	previousView,
	nextView,
	closeActiveView,
	goBack,
	goForward,
	reloadActiveView,
	toggleFullScreen,
	toggleActiveViewDevTools,
	showWelcomeViewForFocusedWindow,
} from "./view-manager";

// Helper function to apply actions to the focused window
function applyToFocusedWindow(action: (win: BrowserWindow) => void) {
	return () => {
		const focusedWindow = BrowserWindow.getFocusedWindow();
		if (focusedWindow) {
			action(focusedWindow);
		}
	};
}

export function registerShortcuts() {
	globalShortcut.unregisterAll();

	// Window and Tab Management
	globalShortcut.register("F1", showWelcomeViewForFocusedWindow);
	globalShortcut.register("F2", applyToFocusedWindow(previousView));
	globalShortcut.register("F3", applyToFocusedWindow(nextView));
	globalShortcut.register("F4", applyToFocusedWindow(closeActiveView));

	// View Actions
	globalShortcut.register("F5", applyToFocusedWindow(reloadActiveView));
	globalShortcut.register("F11", applyToFocusedWindow(toggleFullScreen));
	globalShortcut.register(
		"F12",
		applyToFocusedWindow(toggleActiveViewDevTools)
	);

	// Browser Navigation
	globalShortcut.register("CommandOrControl+[", applyToFocusedWindow(goBack));
	globalShortcut.register(
		"CommandOrControl+]",
		applyToFocusedWindow(goForward)
	);
	globalShortcut.register("Alt+Left", applyToFocusedWindow(goBack));
	globalShortcut.register("Alt+Right", applyToFocusedWindow(goForward));

	// Standard DevTools
	globalShortcut.register(
		"CommandOrControl+Shift+I",
		applyToFocusedWindow(toggleActiveViewDevTools)
	);
}

export function unregisterShortcuts() {
	globalShortcut.unregisterAll();
}
