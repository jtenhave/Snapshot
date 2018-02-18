const MILLISECONDS = 1000;
const PERIOD_LEN = 1200;

/**
 * Convert a time string in format "mm:SS" to a number of seconds.
 */
function toPeriodTime(time, reverse) {
	if (time === "END" || time == "Final") {
		return PERIOD_LEN;
	}

	const timeParts = time.split(":").map(t => parseInt(t));
	const seconds = timeParts[0] * 60 + timeParts[1];
	return reverse ? PERIOD_LEN - seconds : seconds;
}

function toSecondsReversed(time) {
	return PERIOD_LEN - toPeriodTime(time);
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
}