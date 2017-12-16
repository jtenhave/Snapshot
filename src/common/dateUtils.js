const monthNames = [ 
	"January", 
	"February", 
	"March", 
	"April", 
	"May", 
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];

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
 * Convert a Date object to string with format "dddd, MMMM dd, yyyy";
 */
function formatLongDate(date) {
	const weekday = formatWeekday(date);
	const year = date.getFullYear();
	const month = monthNames[date.getMonth()];
	const day = date.getDate();
	return `${weekday}, ${month} ${day}, ${year}`;
}

/**
 * Convert a Date object to string with format "dddd";
 */
function formatWeekday(date) {
	switch(date.getUTCDay()) {
		case 0:
			return "Sunday";
		case 1:
			return "Monday";
		case 2:
			return "Tuesday";
		case 3:
			return "Wednesday";
		case 4:
			return "Thursday";
		case 5:
			return "Friday";
		case 6:
			return "Saturday";
	}
}

/**
 * Convert a Date object to string with format "h:MM tt";
 */
function formatTime(time) {
	let hour = time.getHours();
	const minutes = time.getMinutes();
	const tt = hour < 12 ? "AM" : "PM";
   	hour = hour <= 12 ? hour : hour - 12;

	return `${hour}:${formatWithLeadingZero(minutes)} ${tt}`;
}

/**
 * Formats a number as a string with a leading zero. e.g. 1 becomes "01".
 */
function formatWithLeadingZero(value) {
	return `${(value > 9 ? '' : '0')}${value}`;
}

if (typeof module !== "undefined" && module.exports) {
	module.exports.formatShortDate = formatShortDate;
}