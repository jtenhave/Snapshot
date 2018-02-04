const timeUtils = require("../../common/timeUtils");

/**
 * Class that represents a play between a faceoff and a whistle.
 */
class Play {

    /**
     * Starts a play.
     */
    static start (event) {
        const play = new Play();
        play.start = timeUtils.toSeconds(event.about.periodTime);
        play.startTimestamp = new Date(event.about.dateTime).getTime();
        play.period = event.about.period;

        return play;
    }

    /**
     * Stops a play.
     */
    stop (event, hasStoppage) {
        this.end = timeUtils.toSeconds(event.about.periodTime);
        this.endTimestamp = new Date(event.about.dateTime).getTime();
        this.hasStoppage = hasStoppage;

        // Reset the start time based on the end time. We have to do this because timestamps from the
        // NHL API are not accurate.
        var elapsed = this.end - this.start;
        this.startTimestamp = this.endTimestamp - elapsed * timeUtils.MILLISECONDS;    
    }

    /**
     * Converts a play to minified json.
     */
    toJSON () {
        return {
            s: this.start,
            st: this.startTimestamp,
            e: this.end,
            et: this.endTimestamp,
            p: this.period,
            hs: this.hasStoppage
        };
    }
}

module.exports = Play;
