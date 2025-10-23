/* src/main/main.ts */

import { app, session } from "electron";
import { setupIpcHandlers } from "./ipc-handler";
import { registerShortcuts, unregisterShortcuts } from "./shortcuts";
import { createMainWindow, getWindowCount } from "./window-manager";
import { createAppMenu } from "./app-menu";
import { CACHE_PATH } from "./config-manager";

// Configure Chromium before the app is ready
app.setPath("userData", CACHE_PATH);
app.commandLine.appendSwitch("disable-blink-features", "AutomationControlled");
app.commandLine.appendSwitch(
	"disable-features",
	"SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure"
);
app.commandLine.appendSwitch("allow-insecure-localhost");

// Enable features that Chrome has by default
app.commandLine.appendSwitch(
	"enable-features",
	"NetworkService,NetworkServiceInProcess"
);

// Disable automation-related flags
app.commandLine.appendSwitch("disable-blink-features", "AutomationControlled");
app.commandLine.appendSwitch("exclude-switches", "enable-automation");

app.whenReady().then(async () => {
	const ses = session.defaultSession;

	// Set realistic user agent
	const userAgent = ses.getUserAgent();
	const chromeUserAgent = userAgent.replace(
		/\s(Chromini|Electron)\/[\d\.]+/g,
		""
	);
	ses.setUserAgent(chromeUserAgent);

	// Configure session for better compatibility
	ses.setPreloads([]);

	// Allow third-party cookies (required for Google login)
	await ses.cookies
		.set({
			url: "https://accounts.google.com",
			name: "_test_cookie",
			value: "test",
			sameSite: "no_restriction",
			secure: true,
		})
		.catch(() => {}); // Test cookie setup

	// Remove restrictive headers
	ses.webRequest.onHeadersReceived((details, callback) => {
		const responseHeaders = details.responseHeaders || {};
		delete responseHeaders["content-security-policy"];
		delete responseHeaders["content-security-policy-report-only"];
		delete responseHeaders["permissions-policy"];
		delete responseHeaders["x-frame-options"];
		callback({ responseHeaders });
	});

	// Add headers to appear more like Chrome
	ses.webRequest.onBeforeSendHeaders((details, callback) => {
		const headers = details.requestHeaders;

		// Add Chrome-like headers
		headers["sec-ch-ua"] = '"Chromium";v="130", "Not?A_Brand";v="99"';
		headers["sec-ch-ua-mobile"] = "?0";
		headers["sec-ch-ua-platform"] = '"Linux"';
		headers["sec-fetch-site"] = headers["sec-fetch-site"] || "none";
		headers["sec-fetch-mode"] = headers["sec-fetch-mode"] || "navigate";
		headers["sec-fetch-dest"] = headers["sec-fetch-dest"] || "document";

		// Ensure proper referer and origin for Google
		if (
			details.url.includes("google.com") ||
			details.url.includes("googleapis.com")
		) {
			if (!headers["Referer"] && details.referrer) {
				headers["Referer"] = details.referrer;
			}
		}

		callback({ requestHeaders: headers });
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
