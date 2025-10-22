/* src/renderer/app.tsx */

import { useState, FormEvent, useEffect } from "react";

interface HistoryItem {
	url: string;
	title: string;
}

declare global {
	interface Window {
		electronAPI?: {
			navigateToUrl: (url: string) => void;
			getHistory: () => Promise<HistoryItem[]>;
		};
	}
}

export default function App() {
	const [url, setUrl] = useState("");
	const [history, setHistory] = useState<HistoryItem[]>([]);

	// Fetch history on component mount
	useEffect(() => {
		window.electronAPI?.getHistory().then(setHistory);
	}, []);

	const formatAndNavigate = (inputUrl: string) => {
		if (!inputUrl.trim()) return;

		let formattedUrl = inputUrl.trim();
		if (!/^(https?:\/\/)/.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}

		try {
			// Test if it's a valid URL before sending
			new URL(formattedUrl);
			window.electronAPI?.navigateToUrl(formattedUrl);
		} catch (error) {
			console.error("Invalid URL:", formattedUrl);
			// Maybe show an error to the user here
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		formatAndNavigate(url);
	};

	const handleHistoryClick = (historyUrl: string) => {
		formatAndNavigate(historyUrl);
	};

	return (
		<div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 font-sans">
			<div className="w-full max-w-xl">
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="Enter URL and press Enter"
						className="w-full px-4 py-3 text-lg rounded-lg transition-all 
                     bg-gray-100 dark:bg-gray-900 
                     text-black dark:text-white
                     border border-gray-200 dark:border-gray-800
                     focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
						autoFocus
					/>
				</form>

				{history.length > 0 && (
					<div className="mt-8">
						<h2 className="text-xs text-gray-400 dark:text-gray-600 font-medium uppercase tracking-wider mb-3">
							Recent
						</h2>
						<ul className="space-y-2">
							{history.map((item) => (
								<li key={item.url}>
									<button
										onClick={() => handleHistoryClick(item.url)}
										className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
									>
										<p className="text-sm text-black dark:text-white truncate">
											{item.title}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
											{item.url}
										</p>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
