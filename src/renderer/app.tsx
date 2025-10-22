/* src/renderer/app.tsx */

import { useState, FormEvent, useEffect, MouseEvent } from "react";
import { X } from "lucide-react";

interface HistoryItem {
	url: string;
	title: string;
}

declare global {
	interface Window {
		electronAPI?: {
			navigateToUrl: (url: string) => void;
			getHistory: () => Promise<HistoryItem[]>;
			removeHistoryItem: (url: string) => void;
			onRefreshHistory: (callback: () => void) => void;
		};
	}
}

export default function App() {
	const [url, setUrl] = useState("");
	const [history, setHistory] = useState<HistoryItem[]>([]);

	const fetchHistory = () => {
		window.electronAPI?.getHistory().then(setHistory);
	};

	// Fetch history on component mount and listen for refresh events
	useEffect(() => {
		fetchHistory(); // Initial fetch
		// Listen for F1 press from the main process to refresh
		window.electronAPI?.onRefreshHistory(fetchHistory);
	}, []);

	const formatAndNavigate = (inputUrl: string) => {
		if (!inputUrl.trim()) return;
		let formattedUrl = inputUrl.trim();
		if (!/^(https?:\/\/)/.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		try {
			new URL(formattedUrl);
			window.electronAPI?.navigateToUrl(formattedUrl);
			setUrl(""); // Clear the input field on successful navigation
		} catch (error) {
			console.error("Invalid URL:", formattedUrl);
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		formatAndNavigate(url);
	};

	const handleHistoryClick = (historyUrl: string) => {
		formatAndNavigate(historyUrl);
	};

	const handleHistoryRemove = (
		e: MouseEvent<HTMLButtonElement>,
		urlToRemove: string
	) => {
		e.stopPropagation();
		window.electronAPI?.removeHistoryItem(urlToRemove);
		setHistory((currentHistory) =>
			currentHistory.filter((item) => item.url !== urlToRemove)
		);
	};

	return (
		<div className="h-dvh bg-white dark:bg-black flex flex-col items-center p-8 font-sans">
			<div className="w-full max-w-xl flex flex-col h-full">
				<div className="flex-shrink-0 text-center">
					<h1 className="text-5xl font-bold tracking-tighter text-black dark:text-white">
						Chromini
					</h1>
					<p className="mt-4 text-base text-gray-600 dark:text-gray-400">
						Code. Preview. Immerse.
					</p>
					<form onSubmit={handleSubmit} className="mt-12">
						<input
							type="text"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							className="w-full px-1 py-3 text-lg text-left transition-colors
                                     bg-transparent 
                                     text-black dark:text-white
                                     border-b border-gray-300 dark:border-gray-700
                                     focus:outline-none focus:border-black dark:focus:border-white"
							autoFocus
						/>
					</form>
				</div>

				{history.length > 0 && (
					<div className="group mt-10 flex-grow min-h-0 flex flex-col">
						<h2 className="text-xs text-left text-gray-500 dark:text-gray-600 font-medium uppercase tracking-wider mb-3 px-3 flex-shrink-0">
							Recent
						</h2>
						<ul className="space-y-2 overflow-y-auto h-full pr-2">
							{history.map((item) => (
								<li key={item.url}>
									<button
										onClick={() => handleHistoryClick(item.url)}
										className="group w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center justify-between"
									>
										<div className="truncate w-11/12">
											<p className="text-sm text-black dark:text-white truncate">
												{item.title}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
												{item.url}
											</p>
										</div>
										<button
											onClick={(e) => handleHistoryRemove(e, item.url)}
											className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
											aria-label={`Remove ${item.title} from history`}
										>
											<X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
										</button>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}

				<div className="mt-auto flex-shrink-0 pt-6">
					<div className="flex flex-wrap items-center justify-center gap-x-4 text-xs text-gray-500 dark:text-gray-600">
						<p>
							<b className="font-semibold text-gray-700 dark:text-gray-400">
								F1
							</b>{" "}
							Home
						</p>
						<p>
							<b className="font-semibold text-gray-700 dark:text-gray-400">
								F2
							</b>{" "}
							Prev
						</p>
						<p>
							<b className="font-semibold text-gray-700 dark:text-gray-400">
								F3
							</b>{" "}
							Next
						</p>
						<p>
							<b className="font-semibold text-gray-700 dark:text-gray-400">
								F4
							</b>{" "}
							Close
						</p>
						<p>
							<b className="font-semibold text-gray-700 dark:text-gray-400">
								F5
							</b>{" "}
							Reload
						</p>
						<p>
							<b className="font-semibold text-gray-700 dark:text-gray-400">
								F11
							</b>{" "}
							Fullscreen
						</p>
						<p>
							<b className="font-semibold text-gray-700 dark:text-gray-400">
								F12
							</b>{" "}
							Dev
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
