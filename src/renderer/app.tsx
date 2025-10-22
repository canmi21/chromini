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

		// if empty, return as is
		if (!trimmed) {
			return trimmed;
		}

		// check if already has protocol
		if (
			trimmed.startsWith("http://") ||
			trimmed.startsWith("https://") ||
			trimmed.startsWith("file://")
		) {
			return trimmed;
		}

		// add https by default
		return `https://${trimmed}`;
	};

	// validate url format
	const isValidUrl = (urlString: string): boolean => {
		try {
			const url = new URL(urlString);
			// check if protocol is http, https, or file
			return ["http:", "https:", "file:"].includes(url.protocol);
		} catch {
			return false;
		}
	};

	// handle form submission
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (!url.trim()) {
			setError("Please enter a URL");
			return;
		}

		const formattedUrl = formatUrl(url);

		// validate url
		if (!isValidUrl(formattedUrl)) {
			setError("Invalid URL format");
			return;
		}

		// navigate
		window.electronAPI.navigateToUrl(formattedUrl);
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-8"
			style={{ backgroundColor: "var(--color-bg)" }}
		>
			<div className="w-full max-w-md">
				{/* header */}
				<div className="mb-12 text-center">
					<h1
						className="text-5xl font-bold tracking-tight mb-3"
						style={{ color: "var(--color-text)" }}
					>
						Browser
					</h1>
					<p
						className="text-sm"
						style={{ color: "var(--color-text-secondary)" }}
					>
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
							className="w-full px-4 py-3 text-base rounded-lg transition-all focus:outline-none focus:ring-2"
							style={{
								backgroundColor: "var(--color-input-bg)",
								color: "var(--color-text)",
								borderWidth: "1px",
								borderColor: "var(--color-border)",
								"--tw-ring-color": "var(--color-focus-ring)",
							}}
							autoFocus
						/>

						{error && (
							<p
								className="mt-2 text-sm"
								style={{ color: "var(--color-error)" }}
							>
								{error}
							</p>
						)}
					</div>

					<button
						type="submit"
						className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
						style={{
							backgroundColor: "var(--color-button-bg)",
							color: "var(--color-button-text)",
							"--tw-ring-color": "var(--color-focus-ring)",
							"--tw-ring-offset-color": "var(--color-bg)",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor =
								"var(--color-button-hover)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "var(--color-button-bg)";
						}}
					>
						Continue →
					</button>
				</form>

				{/* footer tips */}
				<div className="mt-12 text-center">
					<p
						className="text-xs"
						style={{ color: "var(--color-text-secondary)" }}
					>
						macOS:{" "}
						<kbd
							className="px-1.5 py-0.5 text-xs rounded"
							style={{
								backgroundColor: "var(--color-kbd-bg)",
								borderWidth: "1px",
								borderColor: "var(--color-kbd-border)",
							}}
						>
							⌘
						</kbd>{" "}
						+{" "}
						<kbd
							className="px-1.5 py-0.5 text-xs rounded"
							style={{
								backgroundColor: "var(--color-kbd-bg)",
								borderWidth: "1px",
								borderColor: "var(--color-kbd-border)",
							}}
						>
							⌥
						</kbd>{" "}
						+{" "}
						<kbd
							className="px-1.5 py-0.5 text-xs rounded"
							style={{
								backgroundColor: "var(--color-kbd-bg)",
								borderWidth: "1px",
								borderColor: "var(--color-kbd-border)",
							}}
						>
							I
						</kbd>{" "}
						or{" "}
						<kbd
							className="px-1.5 py-0.5 text-xs rounded"
							style={{
								backgroundColor: "var(--color-kbd-bg)",
								borderWidth: "1px",
								borderColor: "var(--color-kbd-border)",
							}}
						>
							F12
						</kbd>{" "}
						for DevTools
					</p>
				</div>
			</div>
		</div>
	);
}
