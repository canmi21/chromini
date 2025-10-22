/* src/main/view-manager.ts */

import { BrowserWindow, BrowserView, shell } from "electron"; // shell is already imported
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
	: `file://${path.join(__dirname, "../dist/index.html")}`;

export function setMainWindow(win: BrowserWindow) {
	mainWindow = win;
	// Adjust views on window resize
	mainWindow.on("resize", () => {
		const bounds = mainWindow?.getBounds();
		if (bounds) {
			welcomeView?.setBounds({
				x: 0,
				y: 0,
				width: bounds.width,
				height: bounds.height,
			});
			views.forEach((v) =>
				v.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height })
			);
		}
	});
}

// Function to adjust view bounds to fill the window
function adjustViewBounds(view: BrowserView) {
	if (!mainWindow) return;
	const [width, height] = mainWindow.getSize();
	view.setBounds({ x: 0, y: 0, width, height });
}

// Show the currently active view and update window title
function showActiveView() {
	if (!mainWindow) return;

	// Remove all views first to avoid visual glitches
	mainWindow
		.getBrowserViews()
		.forEach((view) => mainWindow?.removeBrowserView(view));

	let viewToShow: BrowserView | null = null;
	if (activeViewIndex === -1 && welcomeView) {
		viewToShow = welcomeView;
		mainWindow.setTitle("chromini");
	} else if (views[activeViewIndex]) {
		viewToShow = views[activeViewIndex];
		const pageTitle = viewToShow.webContents.getTitle();
		mainWindow.setTitle(pageTitle || "chromini");
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
			preload: path.join(__dirname, "preload.js"),
		},
	});
	mainWindow.addBrowserView(welcomeView);
	adjustViewBounds(welcomeView);
	welcomeView.webContents.loadURL(WELCOME_URL);

	// --- CORRECT WAY TO HANDLE EXTERNAL LINKS (target="_blank") ---
	// This handler intercepts requests to open new windows.
	welcomeView.webContents.setWindowOpenHandler(({ url }) => {
		// Check if the URL is external
		if (url.startsWith("http:") || url.startsWith("https:")) {
			// Open the URL in the user's default browser
			shell.openExternal(url);
		}
		// Deny the request to open a new Electron window
		return { action: "deny" };
	});

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

	// --- CORRECT WAY TO HANDLE EXTERNAL LINKS (target="_blank") ---
	// This handler intercepts requests to open new windows.
	view.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("http:") || url.startsWith("https:")) {
			shell.openExternal(url);
		}
		return { action: "deny" };
	});

	// This handles navigation within the same view (e.g., non-target blank links)
	view.webContents.on("will-navigate", (event, navigationUrl) => {
		const parsedUrl = new URL(navigationUrl);
		// This logic might be adjusted based on desired in-app navigation behavior
		// For a simple browser, you might allow all navigation within the view
	});

	views.push(view);
	activeViewIndex = views.length - 1;

	mainWindow.addBrowserView(view);
	adjustViewBounds(view);
	view.webContents.loadURL(url);

	// Update window title when the page title changes
	view.webContents.on("page-title-updated", (_event, title) => {
		if (mainWindow && getActiveView() === view) {
			mainWindow.setTitle(title);
		}
	});

	// Add to history once page is loaded
	view.webContents.once("did-finish-load", () => {
		const pageUrl = view.webContents.getURL();
		const pageTitle = view.webContents.getTitle();
		addHistoryItem({ url: pageUrl, title: pageTitle });
	});

	createContextMenu(view.webContents);
	showActiveView();
}

export function getActiveView() {
	return activeViewIndex > -1 ? views[activeViewIndex] : null;
}

export function showWelcomeView() {
	activeViewIndex = -1;
	// Tell the welcome view to refresh its history list
	welcomeView?.webContents.send("refresh-history");
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

// Closes the currently active view ("tab")
export function closeActiveView() {
	if (activeViewIndex < 0 || !views[activeViewIndex]) return;

	const viewToClose = views[activeViewIndex];
	(viewToClose.webContents as any).destroy();
	views.splice(activeViewIndex, 1);

	// If we closed the last tab, go to welcome screen
	if (views.length === 0) {
		activeViewIndex = -1;
	} else {
		// Otherwise, ensure the index is still valid
		if (activeViewIndex >= views.length) {
			activeViewIndex = views.length - 1;
		}
	}
	showActiveView();
}

// Toggles the main window's fullscreen state
export function toggleFullScreen() {
	if (mainWindow) {
		mainWindow.setFullScreen(!mainWindow.isFullScreen());
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

export function destroyViews() {
	views.forEach((view) => (view.webContents as any).destroy());
	views.length = 0;
	if (welcomeView) {
		(welcomeView.webContents as any).destroy();
		welcomeView = null;
	}
}
