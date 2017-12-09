
/**
 * Convert a Date object to string with format "yyyy-MM-dd";
 */
function formatShortDate(date) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year}-${formatWithLeadingZero(month)}-${formatWithLeadingZero(day)}`;
}

/**
 * Formats a number as a string with a leading zero. e.g. 1 becomes "01".
 */
function formatWithLeadingZero(value) {
	return `${(value > 9 ? '' : '0')}${value}`;
}

if (module) {
	module.exports.formatShortDate = formatShortDate;
}