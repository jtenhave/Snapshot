const MILLISECONDS = 1000;
const PERIOD_LEN = 1200;

/**
 * Convert a time string in format "mm:SS" to a number of seconds.
 */
function toSeconds(time) {
	const timeParts = time.split(":").map(t => parseInt(t));
	return timeParts[0] * 60 + timeParts[1];
}

/**
 * Convert a time string in format "mm:SS" to a number of seconds in a period.
 */
function toPeriodTime(time, reverse) {
	const seconds = toSeconds(time);
	return reverse ? PERIOD_LEN - seconds : seconds;
}

/**
 * Convert a time string and period to the total number of seconds in the game.
 */
function toTotalTime(time, period, reverse) {
	const seconds = toPeriodTime(time, reverse);
	return period * PERIOD_LEN + seconds;
}

if (typeof module !== "undefined" && module.exports) {
	module.exports.MILLISECONDS = MILLISECONDS;
	module.exports.toPeriodTime = toPeriodTime;
	module.exports.toTotalTime = toTotalTime;
	module.exports.toSeconds = toSeconds;
}
