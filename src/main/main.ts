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
app.commandLine.appendSwitch("disable-features", "SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure");
app.commandLine.appendSwitch("allow-insecure-localhost");

app.whenReady().then(() => {
	const userAgent = session.defaultSession.getUserAgent();
	// This regex finds and removes both "Chromini/Version" and "Electron/Version" strings.
	const chromeUserAgent = userAgent.replace(/\s(Chromini|Electron)\/[\d\.]+/g, '');
	session.defaultSession.setUserAgent(chromeUserAgent);

	// This listener intercepts all network responses to remove restrictive headers.
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		const responseHeaders = details.responseHeaders || {};
		delete responseHeaders["content-security-policy"];
		delete responseHeaders["content-security-policy-report-only"];
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