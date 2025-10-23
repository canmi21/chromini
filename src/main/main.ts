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
app.commandLine.appendSwitch("exclude-switches", "enable-automation");

// Allow loading local resources
app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch("allow-file-access-from-files");

app.whenReady().then(async () => {
	// Use persistent session
	const ses = session.fromPartition("persist:main");

	// Set realistic user agent
	const userAgent = ses.getUserAgent();
	const chromeUserAgent = userAgent.replace(
		/\s(Chromini|Electron)\/[\d\.]+/g,
		""
	);
	ses.setUserAgent(chromeUserAgent);

	// Configure session
	ses.setPreloads([]);

	// Allow third-party cookies
	await ses.cookies
		.set({
			url: "https://accounts.google.com",
			name: "_test_cookie",
			value: "test",
			sameSite: "no_restriction",
			secure: true,
		})
		.catch(() => {});

	// Remove restrictive headers
	ses.webRequest.onHeadersReceived((details, callback) => {
		const responseHeaders = details.responseHeaders || {};
		delete responseHeaders["content-security-policy"];
		delete responseHeaders["content-security-policy-report-only"];
		delete responseHeaders["permissions-policy"];
		delete responseHeaders["x-frame-options"];

		// Allow CORS for localhost
		if (
			details.url.includes("localhost") ||
			details.url.includes("127.0.0.1")
		) {
			responseHeaders["access-control-allow-origin"] = ["*"];
			responseHeaders["access-control-allow-methods"] = [
				"GET, POST, PUT, DELETE, OPTIONS",
			];
			responseHeaders["access-control-allow-headers"] = ["*"];
		}

		callback({ responseHeaders });
	});

	// Add Chrome-like headers
	ses.webRequest.onBeforeSendHeaders((details, callback) => {
		const headers = details.requestHeaders;

		// Add Chrome-like headers
		headers["sec-ch-ua"] = '"Chromium";v="130", "Not?A_Brand";v="99"';
		headers["sec-ch-ua-mobile"] = "?0";
		headers["sec-ch-ua-platform"] = '"Linux"';

		// Set proper fetch headers based on request type
		if (!headers["sec-fetch-site"]) {
			// Localhost requests should be same-origin
			if (
				details.url.includes("localhost") ||
				details.url.includes("127.0.0.1")
			) {
				headers["sec-fetch-site"] = "same-origin";
			} else {
				headers["sec-fetch-site"] = "none";
			}
		}

		headers["sec-fetch-mode"] = headers["sec-fetch-mode"] || "cors";
		headers["sec-fetch-dest"] = headers["sec-fetch-dest"] || "empty";

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
