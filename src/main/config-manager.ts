/* src/main/config-manager.ts */

import { app } from "electron";
import path from "path";
import fs from "fs";

// Define the structure of our configuration
interface Config {
	windowBounds: { width: number; height: number };
	history: { url: string; title: string; favicon: string }[];
}

const HOME = app.getPath("home");
const CONFIG_DIR = path.join(HOME, ".chromini");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
export const CACHE_PATH = path.join(CONFIG_DIR, "cache");

const DEFAULT_CONFIG: Config = {
	windowBounds: { width: 1280, height: 720 }, // Default to 16:9
	history: [],
};

// --- New Helper Function ---
// Normalizes a URL for more reliable comparison.
// Removes hash, and trailing slash.
function normalizeUrl(urlString: string): string {
	try {
		const url = new URL(urlString);
		url.hash = ""; // Remove fragment identifier
		let pathname = url.pathname;
		// Remove trailing slash if it's not the root
		if (pathname.length > 1 && pathname.endsWith("/")) {
			pathname = pathname.slice(0, -1);
		}
		return `${url.protocol}//${url.host}${pathname}${url.search}`;
	} catch {
		// If URL is invalid, return as is
		return urlString;
	}
}

// Ensure the config directory and cache directory exist
function ensureDirsExist() {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR);
	}
	if (!fs.existsSync(CACHE_PATH)) {
		fs.mkdirSync(CACHE_PATH);
	}
}

// Get the current configuration from file, or return defaults
export function getConfig(): Config {
	ensureDirsExist();
	try {
		if (fs.existsSync(CONFIG_PATH)) {
			const rawData = fs.readFileSync(CONFIG_PATH, "utf-8");
			return JSON.parse(rawData);
		}
	} catch (error) {
		console.error(
			"Failed to read or parse config file, using defaults.",
			error
		);
	}
	return DEFAULT_CONFIG;
}

// Save the configuration object to file
export function saveConfig(config: Config) {
	ensureDirsExist();
	try {
		fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
	} catch (error) {
		console.error("Failed to save config file.", error);
	}
}

// Add a new entry to the history, keeping only the last 50
export function addHistoryItem(item: {
	url: string;
	title: string;
	favicon: string;
}) {
	const config = getConfig();
	const normalizedUrl = normalizeUrl(item.url);

	// Find and remove any existing entry with the same normalized URL
	// This ensures uniqueness and moves the item to the top.
	const existingIndex = config.history.findIndex(
		(h) => normalizeUrl(h.url) === normalizedUrl
	);

	if (existingIndex > -1) {
		config.history.splice(existingIndex, 1);
	}

	// Add the new (or updated) item to the beginning of the list
	config.history.unshift(item);
	config.history = config.history.slice(0, 50); // Keep last 50
	saveConfig(config);
}

// Removes a specific item from history by its URL
export function removeHistoryItem(urlToRemove: string) {
	const config = getConfig();
	const normalizedUrlToRemove = normalizeUrl(urlToRemove);

	config.history = config.history.filter(
		(item) => normalizeUrl(item.url) !== normalizedUrlToRemove
	);

	saveConfig(config);
}
