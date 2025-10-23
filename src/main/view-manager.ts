/* src/main/view-manager.ts */

import { BrowserWindow, BrowserView, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { addHistoryItem } from "./config-manager";
import { createContextMenu, createWelcomeContextMenu } from "./context-menu";

// --- Global "Timeline" for all views across all windows ---
interface ViewItem {
	view: BrowserView;
	parentWindow: BrowserWindow;
}
export const allViews: ViewItem[] = [];
let activeViewIndex = -1;
// -----------------------------------------------------------

// Recreate __dirname for ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";
const WELCOME_URL = isDev
	? "http://localhost:5173"
	: `file://${path.join(__dirname, "../dist/index.html")}`;

export function setMainWindow(win: BrowserWindow) {
	// --- THIS IS A KEY FIX ---
	// The 'resize' event might fire before the window is fully ready.
	// Using 'ready-to-show' and a small delay ensures we get accurate content bounds.
	win.once("ready-to-show", () => {
		win.on("resize", () => {
			const activeItem = getActiveView();
			// Only resize the view if it belongs to the window being resized
			if (activeItem && activeItem.parentWindow === win) {
				adjustViewBounds(activeItem.view, win);
			} else {
				// Handle resizing for welcome views as well
				const currentViews = win.getBrowserViews();
				if (currentViews.length > 0) {
					adjustViewBounds(currentViews[0], win);
				}
			}
		});
	});
}

// Function to adjust view bounds to fill the window's *content area*
function adjustViewBounds(view: BrowserView, parentWindow: BrowserWindow) {
	if (!parentWindow) return;
	// --- THIS IS THE CRITICAL CHANGE ---
	// Use getContentBounds() instead of getSize() to get the drawable area below the title bar.
	const { width, height } = parentWindow.getContentBounds();
	view.setBounds({ x: 0, y: 0, width, height });
}

// Attaches the correct view to its parent window and focuses it
function showActiveView() {
	if (activeViewIndex < 0 || !allViews[activeViewIndex]) {
		const focusedWindow = BrowserWindow.getFocusedWindow();
		if (focusedWindow) {
			focusedWindow
				.getBrowserViews()
				.forEach((v) => focusedWindow.removeBrowserView(v));
			focusedWindow.setTitle("chromini");
		}
		return;
	}

	const { view, parentWindow } = allViews[activeViewIndex];

	if (!parentWindow.isFocused()) {
		parentWindow.focus();
	}

	parentWindow
		.getBrowserViews()
		.forEach((v) => parentWindow.removeBrowserView(v));
	parentWindow.setBrowserView(view);

	adjustViewBounds(view, parentWindow); // Use the corrected function
	const pageTitle = view.webContents.getTitle();
	parentWindow.setTitle(pageTitle || "chromini");
}

function addViewToRegistry(view: BrowserView, parentWindow: BrowserWindow) {
	const viewItem: ViewItem = { view, parentWindow };
	allViews.push(viewItem);
	activeViewIndex = allViews.length - 1;

	view.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: "deny" };
	});
}

export function createWelcomeView(parentWindow: BrowserWindow) {
	const welcomeView = new BrowserView({
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			webSecurity: false,
		},
	});

	parentWindow.setBrowserView(welcomeView);
	adjustViewBounds(welcomeView, parentWindow); // Use the corrected function
	welcomeView.webContents.loadURL(WELCOME_URL);

	welcomeView.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: "deny" };
	});

	createWelcomeContextMenu(welcomeView.webContents);
}

export function createView(url: string, parentWindow: BrowserWindow) {
	const view = new BrowserView({
		webPreferences: {
			contextIsolation: true,
			webSecurity: false,
		},
	});

	addViewToRegistry(view, parentWindow);
	view.webContents.loadURL(url);

	view.webContents.on("page-title-updated", (_event, title) => {
		if (getActiveView()?.view === view) {
			parentWindow.setTitle(title);
		}
	});

	view.webContents.once("did-finish-load", () => {
		const pageUrl = view.webContents.getURL();
		const pageTitle = view.webContents.getTitle();
		addHistoryItem({ url: pageUrl, title: pageTitle });
	});

	createContextMenu(view.webContents);
	showActiveView();
}

export function getActiveView() {
	return activeViewIndex > -1 ? allViews[activeViewIndex] : null;
}

export function nextView() {
	if (allViews.length === 0) return;
	activeViewIndex = (activeViewIndex + 1) % allViews.length;
	showActiveView();
}

export function previousView() {
	if (allViews.length === 0) return;
	activeViewIndex = (activeViewIndex - 1 + allViews.length) % allViews.length;
	showActiveView();
}

export function closeActiveView() {
	const activeItem = getActiveView();
	if (!activeItem) return;

	(activeItem.view.webContents as any).destroy();
	allViews.splice(activeViewIndex, 1);

	const windowHadLastTab = activeItem.parentWindow;
	const remainingTabsInWindow = allViews.some(
		(item) => item.parentWindow === windowHadLastTab
	);
	if (!remainingTabsInWindow) {
		createWelcomeView(windowHadLastTab);
	}

	if (activeViewIndex >= allViews.length) {
		activeViewIndex = allViews.length - 1;
	}

	if (allViews.length === 0) {
		activeViewIndex = -1;
	}

	showActiveView();
}

export function goBack() {
	const activeItem = getActiveView();
	if (activeItem && activeItem.view.webContents.canGoBack()) {
		activeItem.view.webContents.goBack();
	}
}

export function goForward() {
	const activeItem = getActiveView();
	if (activeItem && activeItem.view.webContents.canGoForward()) {
		activeItem.view.webContents.goForward();
	}
}

export function reloadActiveView() {
	const activeItem = getActiveView();
	if (activeItem) {
		activeItem.view.webContents.reload();
	}
}

export function toggleFullScreen() {
	const activeItem = getActiveView();
	const window = activeItem?.parentWindow || BrowserWindow.getFocusedWindow();
	if (window) {
		window.setFullScreen(!window.isFullScreen());
	}
}

export function toggleActiveViewDevTools() {
	const activeItem = getActiveView();
	if (activeItem) {
		activeItem.view.webContents.toggleDevTools();
	} else {
		const focusedWindow = BrowserWindow.getFocusedWindow();
		const activeView = focusedWindow?.getBrowserViews()[0];
		if (activeView) {
			activeView.webContents.toggleDevTools();
		}
	}
}

export function destroyViewsForWindow(win: BrowserWindow) {
	for (let i = allViews.length - 1; i >= 0; i--) {
		if (allViews[i].parentWindow === win) {
			(allViews[i].view.webContents as any).destroy();
			allViews.splice(i, 1);
		}
	}
	if (activeViewIndex >= allViews.length) {
		activeViewIndex = allViews.length - 1;
	}
	showActiveView();
}
