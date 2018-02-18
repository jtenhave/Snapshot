const timeUtils = require("../../common/timeUtils");

/**
 * Class that represents a play between a faceoff and a whistle.
 */
class Play {

    /**
     * Stops a play.
     */
    stop(event) {
        this.end = event.periodTime;
        this.endTimestamp = event.timestamp;
        this.finished = true;

        // Reset the start time based on the end time. We have to do this because timestamps from the
        // NHL API are not accurate.
        var elapsed = this.end - this.start;
        this.startTimestamp = this.endTimestamp - elapsed * timeUtils.MILLISECONDS;    
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON() {
        return {
            s: this.start,
            st: this.startTimestamp,
            e: this.end,
            et: this.endTimestamp,
            p: this.period
        };
    }

    /**
     * Starts a play.
     */
    static start(event) {
        const play = new Play();
        play.start = event.periodTime;
        play.startTimestamp = event.timestamp;
        play.period = event.period;
        play.finished = false;

        return play;
    }

    /**
     * Creates a Play from a minified JSON object.
     */
    static fromJSON(json) {
        const play = new Play();
        play.start = json.s;
        play.startTimestamp = json.st;
        play.end = json.e;
        play.endTimestamp = json.et;
        play.period = json.p;

        return play;
    }
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = Play;
}
