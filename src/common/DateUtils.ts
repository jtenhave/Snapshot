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
 * Class containing utilities for working with dates.
 */
export class DateUtils {

    /**
     * Convert a Date object to string with format "yyyy-MM-dd";
     */
    static formatShortDate(date: Date): string {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${DateUtils.formatWithLeadingZero(month)}-${DateUtils.formatWithLeadingZero(day)}`;
    }

    /**
     * Convert a Date object to string with format "dddd, MMMM dd, yyyy";
     */
    static formatLongDate(date: Date): string {
        const weekday = DateUtils.formatWeekday(date);
        const year = date.getFullYear();
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        return `${weekday}, ${month} ${day}, ${year}`;
    }

    /**
     * Convert a Date object to string with format "dddd";
     */
    static formatWeekday(date: Date): string {
        switch(date.getDay()) {
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
     * Formats a number as a string with a leading zero. e.g. 1 becomes "01".
     */
    static formatWithLeadingZero(value: number): string {
        return `${(value > 9 ? '' : '0')}${value}`;
    }

    /**
     * Convert a Date object to string with format "h:MM tt";
     */
    static formatTime(time: Date): string {
        let hour = time.getHours();
        const minutes = time.getMinutes();
        const tt = hour < 12 ? "AM" : "PM";
        hour = hour <= 12 ? hour : hour - 12;

        return `${hour}:${DateUtils.formatWithLeadingZero(minutes)} ${tt}`;
    }
}