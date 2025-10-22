/* src/renderer/app.tsx */

import { useState, FormEvent, useEffect } from "react";

declare global {
	interface Window {
		electronAPI?: {
			navigateToUrl: (url: string) => void;
		};
	}
}

export default function App() {
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");
	const [apiReady, setApiReady] = useState(false);

	// check if electron api is ready
	useEffect(() => {
		if (window.electronAPI) {
			setApiReady(true);
			console.log("Electron API is ready");
		} else {
			console.error("Electron API not found!");
			setError("Electron API not available");
		}
	}, []);

	const formatUrl = (input: string): string => {
		const trimmed = input.trim();
		if (!trimmed) return trimmed;

		if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
			return trimmed;
		}

		return `https://${trimmed}`;
	};

	const isValidUrl = (urlString: string): boolean => {
		try {
			const url = new URL(urlString);
			return ["http:", "https:"].includes(url.protocol);
		} catch {
			return false;
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		console.log("Form submitted, URL:", url);

		if (!apiReady || !window.electronAPI) {
			setError("Electron API not ready");
			console.error("Electron API not available");
			return;
		}

		if (!url.trim()) {
			setError("Please enter a URL");
			return;
		}

		const formattedUrl = formatUrl(url);
		console.log("Formatted URL:", formattedUrl);

		if (!isValidUrl(formattedUrl)) {
			setError("Invalid URL format");
			return;
		}

		try {
			window.electronAPI.navigateToUrl(formattedUrl);
			console.log("Navigation requested");
			setUrl("");
			setError("");
		} catch (err) {
			console.error("Navigation error:", err);
			setError("Failed to navigate");
		}
	};

	return (
		<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-8">
			<div className="w-full max-w-md">
				<div className="mb-12 text-center">
					<h1 className="text-5xl font-bold tracking-tight text-black dark:text-white mb-3">
						Browser
					</h1>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Enter a URL to begin
					</p>
					{!apiReady && (
						<p className="text-xs text-red-600 dark:text-red-400 mt-2">
							⚠️ Electron API not ready
						</p>
					)}
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<input
							type="text"
							value={url}
							onChange={(e) => {
								setUrl(e.target.value);
								setError("");
							}}
							placeholder="example.com"
							className="w-full px-4 py-3 text-base rounded-lg transition-all 
							         bg-white dark:bg-black 
							         text-black dark:text-white
							         border border-gray-300 dark:border-gray-700
							         focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
							autoFocus
						/>
						{error && (
							<p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
						)}
					</div>

					<button
						type="submit"
						disabled={!apiReady}
						className="w-full font-medium py-3 px-4 rounded-lg transition-colors
						         bg-black dark:bg-white 
						         text-white dark:text-black
						         hover:bg-gray-800 dark:hover:bg-gray-200
						         disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Continue →
					</button>
				</form>

				<div className="mt-12 space-y-2 text-xs text-gray-500 dark:text-gray-600">
					<p>F1 - Back to URL input</p>
					<p>F2 - Previous tab</p>
					<p>F3 - Next tab</p>
					<p>F5 - Reload page</p>
					<p>F12 - Toggle DevTools</p>
				</div>
			</div>
		</div>
	);
}
