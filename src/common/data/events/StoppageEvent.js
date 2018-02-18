const Event = require("./_Event");

/**
 * Class that represents a stoppage event in a game.
 */
class StoppageEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.isPlayStopEvent = true;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = StoppageEvent;
}
