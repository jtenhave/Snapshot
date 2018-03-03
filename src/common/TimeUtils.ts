
/**
 * Class containing utilities for working with times.
 */
export class TimeUtils {
    
    private static PERIOD_LEN: number = 1200;

    /**
     * Milliseconds.
     */
    static MILLISECONDS: number = 1000; 
    
    /**
     * Convert a time string in format "mm:SS" to a number of seconds.
     */
    static toSeconds(time: string): number {
        const timeParts = time.split(":").map(t => parseInt(t));
        return timeParts[0] * 60 + timeParts[1];
    }
    
    /**
     * Convert a time string in format "mm:SS" to a number of seconds in a period.
     */
    static toPeriodTime(time: string, reverse?: boolean): number {
        const seconds = TimeUtils.toSeconds(time);
        return reverse ? TimeUtils.PERIOD_LEN - seconds : seconds;
    }
    
    /**
     * Convert a time string and period to the total number of seconds in the game.
     */
    static toTotalTime(time: string, period: number, reverse?: boolean) {
        const seconds = TimeUtils.toPeriodTime(time, reverse);
        return period * TimeUtils.PERIOD_LEN + seconds;
    }
}
