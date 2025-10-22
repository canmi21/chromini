/* src/main/view-manager.ts */

import { BrowserWindow, BrowserView } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { addHistoryItem } from "./config-manager";
import { createContextMenu } from "./context-menu";

// Recreate __dirname for ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let welcomeView: BrowserView | null = null;
const views: BrowserView[] = [];
let activeViewIndex = -1; // -1 means welcome view is active

const isDev = process.env.NODE_ENV === "development";
// Define URL for the welcome screen (renderer)
const WELCOME_URL = isDev
	? "http://localhost:5173"
	: `file://${path.join(__dirname, "../dist/index.html")}`; // Correctly use path.join

export function setMainWindow(win: BrowserWindow) {
	mainWindow = win;
	// Adjust views on window resize
	mainWindow.on("resize", () => {
		const bounds = mainWindow?.getBounds();
		if (bounds) {
			welcomeView?.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height });
			views.forEach((v) => v.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height }));
		}
	});
}

// Function to adjust view bounds to fill the window
function adjustViewBounds(view: BrowserView) {
	if (!mainWindow) return;
	const [width, height] = mainWindow.getSize();
	view.setBounds({ x: 0, y: 0, width, height });
}

// Show the currently active view (or welcome view)
function showActiveView() {
	if (!mainWindow) return;

	// Remove all views first to avoid visual glitches
	mainWindow.getBrowserViews().forEach((view) => mainWindow?.removeBrowserView(view));

	let viewToShow: BrowserView | null = null;
	if (activeViewIndex === -1 && welcomeView) {
		viewToShow = welcomeView;
	} else if (views[activeViewIndex]) {
		viewToShow = views[activeViewIndex];
	}

	if (viewToShow) {
		mainWindow.setBrowserView(viewToShow);
		adjustViewBounds(viewToShow);
	}
}

export function createWelcomeView() {
	if (!mainWindow) return;
	welcomeView = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // Also needs preload
        }
    });
	mainWindow.addBrowserView(welcomeView);
	adjustViewBounds(welcomeView);
	welcomeView.webContents.loadURL(WELCOME_URL);
	showActiveView();
}

export function createView(url: string) {
	if (!mainWindow) return;

	const view = new BrowserView({
		webPreferences: {
			contextIsolation: true,
			webSecurity: true,
		},
	});

	views.push(view);
	activeViewIndex = views.length - 1;

	mainWindow.addBrowserView(view);
	adjustViewBounds(view);
	view.webContents.loadURL(url);

	// Add to history once page is loaded
	view.webContents.once("did-finish-load", () => {
		const pageUrl = view.webContents.getURL();
		const pageTitle = view.webContents.getTitle();
		addHistoryItem({ url: pageUrl, title: pageTitle, favicon: "" });
	});

	createContextMenu(view.webContents);
	showActiveView();
}

export function showWelcomeView() {
	activeViewIndex = -1;
	showActiveView();
}

export function nextView() {
	if (views.length === 0) return;
	activeViewIndex = (activeViewIndex + 1) % views.length;
	showActiveView();
}

export function previousView() {
	if (views.length === 0) return;
	activeViewIndex = (activeViewIndex - 1 + views.length) % views.length;
	showActiveView();
}

export function reloadActiveView() {
	if (activeViewIndex > -1 && views[activeViewIndex]) {
		views[activeViewIndex].webContents.reloadIgnoringCache();
	}
}

export function toggleActiveViewDevTools() {
	if (activeViewIndex > -1 && views[activeViewIndex]) {
		views[activeViewIndex].webContents.toggleDevTools();
	} else if (isDev && welcomeView) {
		// Allow devtools on welcome screen in dev mode
		welcomeView.webContents.toggleDevTools();
	}
}

export function getActiveView() {
	return activeViewIndex > -1 ? views[activeViewIndex] : null;
}

export function destroyViews() {
	views.forEach((view) => (view.webContents as any).destroy());
	views.length = 0;
	if (welcomeView) {
		(welcomeView.webContents as any).destroy();
		welcomeView = null;
	}
}