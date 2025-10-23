/* src/main/main.ts */

import { app, session } from "electron";
import { setupIpcHandlers } from "./ipc-handler";
import { registerShortcuts, unregisterShortcuts } from "./shortcuts";
import { createMainWindow, getWindowCount } from "./window-manager";
import { createAppMenu } from "./app-menu";
import { CACHE_PATH } from "./config-manager";

// --- Configure Chromium before the app is ready ---

app.setPath("userData", CACHE_PATH);

app.commandLine.appendSwitch("disable-blink-features", "AutomationControlled");
app.commandLine.appendSwitch(
	"disable-features",
	"SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure"
);
app.commandLine.appendSwitch("allow-insecure-localhost");

app.whenReady().then(() => {
	// Set a standard Chrome User Agent
	const userAgent = session.defaultSession.getUserAgent();
	const chromeUserAgent = userAgent.replace(/Electron\/[\d\.]+\s/, "");
	session.defaultSession.setUserAgent(chromeUserAgent);

	// --- Intercept and modify network headers ---
	// This listener intercepts all network responses.
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		const responseHeaders = details.responseHeaders || {};

		// Remove Content-Security-Policy headers sent by the server.
		// This is the key to fixing login issues on sites like Google/Gemini.
		delete responseHeaders["content-security-policy"];
		delete responseHeaders["content-security-policy-report-only"];

		// Also remove the Permissions-Policy header that causes console errors.
		delete responseHeaders["permissions-policy"];

		callback({ responseHeaders });
	});

	setupIpcHandlers();
	registerShortcuts();
	createAppMenu();
	createMainWindow();

	app.on("activate", () => {
		if (getWindowCount() === 0) {
			createMainWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("will-quit", () => {
	unregisterShortcuts();
});
