const MILLISECONDS = 1000;

/**
 * Convert a time string in format "mm:SS" to a number of seconds.
 */
function toSeconds(time) {
	const timeParts = time.split(":").map(t => parseInt(t));
	return timeParts[0] * 60 + timeParts[1];
}

if (typeof module !== "undefined" && module.exports) {
	module.exports.MILLISECONDS = MILLISECONDS;
	module.exports.toSeconds = toSeconds;
}