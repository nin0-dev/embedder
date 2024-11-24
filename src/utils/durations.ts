export function getFormattedTime(ms: number) {
	const hours = Math.floor(Math.floor(ms / 1000) / 3600);
	const minutes = Math.floor(Math.floor(ms / 1000) / 60) - hours * 60;
	const seconds = Math.floor(
		Math.floor(ms / 1000) - minutes * 60 - hours * 3600
	);

	return `${
		hours !== 0 ? `${hours}:` : ""
	}${minutes}:${seconds.toString().padStart(2, "0")}`;
}
