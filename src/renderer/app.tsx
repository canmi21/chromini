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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
						Simple Browser
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Enter a URL to start browsing
					</p>
				</div>

				{/* url input form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
						<label
							htmlFor="url-input"
							className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
						>
							Website URL
						</label>

						<input
							id="url-input"
							type="text"
							value={url}
							onChange={(e) => {
								setUrl(e.target.value);
								setError("");
							}}
							placeholder="example.com or https://example.com"
							className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500
                       transition-colors"
							autoFocus
						/>

						{error && (
							<p className="mt-2 text-sm text-red-600 dark:text-red-400">
								{error}
							</p>
						)}

						<button
							type="submit"
							className="w-full mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                       text-white font-medium py-3 px-4 rounded-lg
                       transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       dark:focus:ring-offset-gray-800"
						>
							Go
						</button>
					</div>
				</form>

				{/* tips */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Press{" "}
						<kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
							F12
						</kbd>{" "}
						to open developer tools
					</p>
				</div>
			</div>
		</div>
	);
}
