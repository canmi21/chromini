/* src/main/view-manager.ts */

import { BrowserWindow, BrowserView, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { addHistoryItem } from "./config-manager";
import { createContextMenu, createWelcomeContextMenu } from "./context-menu";

// --- NEW DATA STRUCTURE: Per-window tab management ---
interface TabState {
	views: BrowserView[];
	activeIndex: number;
}
const windowTabs = new Map<BrowserWindow, TabState>();
// -----------------------------------------------------------

const GITHUB_URL = "https://github.com/canmi21/chromini";

// Recreate __dirname for ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";
const WELCOME_URL = isDev
	? "http://localhost:5173"
	: `file://${path.join(__dirname, "../dist/index.html")}`;

// Initializes a new window's tab state
export function initializeWindow(win: BrowserWindow) {
	windowTabs.set(win, { views: [], activeIndex: -1 });
	createWelcomeView(win); // Each new window starts with a welcome page
}

// Cleans up a window's tab state when it's closed
export function cleanupWindow(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (state) {
		state.views.forEach((view) => (view.webContents as any)?.destroy());
		windowTabs.delete(win);
	}
}

function adjustViewBounds(view: BrowserView, parentWindow: BrowserWindow) {
	if (!parentWindow || parentWindow.isDestroyed()) return;
	const { width, height } = parentWindow.getContentBounds();
	view.setBounds({ x: 0, y: 0, width, height });
}

// Shows the active tab for a specific window
function showActiveView(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (!state) return;

	win.getBrowserViews().forEach((v) => win.removeBrowserView(v));

	if (state.activeIndex === -1 || !state.views[state.activeIndex]) {
		// No active tab, show the welcome view
		createWelcomeView(win);
		win.setTitle("Chromini");
	} else {
		const view = state.views[state.activeIndex];
		win.setBrowserView(view);
		adjustViewBounds(view, win);
		win.setTitle(view.webContents.getTitle() || "Chromini");
	}
}

export function createWelcomeView(parentWindow: BrowserWindow) {
	const welcomeView = new BrowserView({
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			webSecurity: false,
		},
	});

	parentWindow.setBrowserView(welcomeView);
	adjustViewBounds(welcomeView, parentWindow);
	welcomeView.webContents.loadURL(WELCOME_URL);

	// Special link handler for the welcome page
	welcomeView.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("https://github.com/canmi21/chromini")) {
			shell.openExternal(url); // ONLY the GitHub link opens externally
		} else {
			createView(url, parentWindow); // Other links open as new tabs
		}
		return { action: "deny" };
	});

	parentWindow.on("resize", () => adjustViewBounds(welcomeView, parentWindow));
	createWelcomeContextMenu(welcomeView.webContents);
}

export function createView(url: string, parentWindow: BrowserWindow) {
	const state = windowTabs.get(parentWindow);
	if (!state) return;

	const view = new BrowserView({
		webPreferences: {
			contextIsolation: true,
			webSecurity: false,
		},
	});

	// Standard link handler for all web content
	view.webContents.setWindowOpenHandler(({ url }) => {
		// ALL links that would open a new window are now opened as a new tab
		createView(url, parentWindow);
		return { action: "deny" };
	});

	// Insert the new view after the current one
	const newIndex = state.activeIndex + 1;
	state.views.splice(newIndex, 0, view);
	state.activeIndex = newIndex;

	parentWindow.on("resize", () => adjustViewBounds(view, parentWindow));

	view.webContents.loadURL(url);
	view.webContents.on("page-title-updated", (_event, title) => {
		if (windowTabs.get(parentWindow)?.views[state.activeIndex] === view) {
			parentWindow.setTitle(title);
		}
	});
	view.webContents.once("did-finish-load", () => {
		addHistoryItem({
			url: view.webContents.getURL(),
			title: view.webContents.getTitle(),
		});
	});

	createContextMenu(view.webContents);
	showActiveView(parentWindow);
}

// --- All functions below are now window-specific ---

export function showWelcomeViewForFocusedWindow() {
	const win = BrowserWindow.getFocusedWindow();
	if (win) {
		const state = windowTabs.get(win);
		if (state) {
			state.activeIndex = -1; // Deactivate all tabs
			showActiveView(win);
		}
	}
}

export function nextView(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (state && state.views.length > 0) {
		state.activeIndex = (state.activeIndex + 1) % state.views.length;
		showActiveView(win);
	}
}

export function previousView(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (state && state.views.length > 0) {
		state.activeIndex =
			(state.activeIndex - 1 + state.views.length) % state.views.length;
		showActiveView(win);
	}
}

export function closeActiveView(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (!state || state.activeIndex < 0) return;

	const viewToClose = state.views[state.activeIndex];
	(viewToClose.webContents as any)?.destroy();
	state.views.splice(state.activeIndex, 1);

	if (state.activeIndex >= state.views.length) {
		state.activeIndex = state.views.length - 1;
	}

	if (state.views.length === 0) {
		state.activeIndex = -1;
	}

	showActiveView(win);
}

export function goBack(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (state && state.activeIndex >= 0) {
		const view = state.views[state.activeIndex];
		if (view.webContents.canGoBack()) {
			view.webContents.goBack();
		}
	}
}

export function goForward(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (state && state.activeIndex >= 0) {
		const view = state.views[state.activeIndex];
		if (view.webContents.canGoForward()) {
			view.webContents.goForward();
		}
	}
}

export function reloadActiveView(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (state && state.activeIndex >= 0) {
		state.views[state.activeIndex].webContents.reload();
	} else {
		const welcomeView = win.getBrowserViews()[0];
		welcomeView?.webContents.reload();
	}
}

export function toggleFullScreen(win: BrowserWindow) {
	win.setFullScreen(!win.isFullScreen());
}

export function toggleActiveViewDevTools(win: BrowserWindow) {
	const state = windowTabs.get(win);
	if (state && state.activeIndex >= 0) {
		state.views[state.activeIndex].webContents.toggleDevTools();
	} else {
		// Handle devtools for welcome page
		const welcomeView = win.getBrowserViews()[0];
		welcomeView?.webContents.toggleDevTools();
	}
}
