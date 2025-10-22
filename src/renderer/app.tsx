/* src/renderer/app.tsx */

import { useState, FormEvent } from "react";

// extend window type
declare global {
	interface Window {
		electronAPI: {
			navigateToUrl: (url: string) => void;
		};
	}
}

export default function App() {
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");

	// validate and format url
	const formatUrl = (input: string): string => {
		const trimmed = input.trim();

		// check if already has protocol
		if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
			return trimmed;
		}

		// add https by default
		return `https://${trimmed}`;
	};

	// handle form submission
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (!url.trim()) {
			setError("Please enter a URL");
			return;
		}

		const formattedUrl = formatUrl(url);

		// basic url validation
		try {
			new URL(formattedUrl);
			window.electronAPI.navigateToUrl(formattedUrl);
		} catch {
			setError("Invalid URL format");
		}
	};

	return (
		<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-8">
			<div className="w-full max-w-md">
				{/* header */}
				<div className="mb-12 text-center">
					<h1 className="text-5xl font-bold tracking-tight text-black dark:text-white mb-3">
						Browser
					</h1>
					<p className="text-gray-600 dark:text-gray-400 text-sm">
						Enter a URL to begin
					</p>
				</div>

				{/* url input form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<input
							id="url-input"
							type="text"
							value={url}
							onChange={(e) => {
								setUrl(e.target.value);
								setError("");
							}}
							placeholder="example.com"
							className="w-full px-4 py-3 text-base
                       bg-white dark:bg-black
                       text-black dark:text-white
                       border border-gray-300 dark:border-gray-700
                       rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white
                       placeholder-gray-400 dark:placeholder-gray-600
                       transition-all"
							autoFocus
						/>

						{error && (
							<p className="mt-2 text-sm text-red-600 dark:text-red-400">
								{error}
							</p>
						)}
					</div>

					<button
						type="submit"
						className="w-full bg-black dark:bg-white
                     text-white dark:text-black
                     font-medium py-3 px-4 rounded-lg
                     hover:bg-gray-800 dark:hover:bg-gray-200
                     transition-colors duration-150
                     focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black"
					>
						Continue →
					</button>
				</form>

				{/* footer tips */}
				<div className="mt-12 text-center">
					<p className="text-xs text-gray-500 dark:text-gray-600">
						macOS:{" "}
						<kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded">
							⌘
						</kbd>{" "}
						+{" "}
						<kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded">
							⌥
						</kbd>{" "}
						+{" "}
						<kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded">
							I
						</kbd>{" "}
						for DevTools
					</p>
				</div>
			</div>
		</div>
	);
}
