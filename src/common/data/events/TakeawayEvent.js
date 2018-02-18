const Event = require("./_Event");

/**
 * Class that represents a takeaway event in a game.
 */
class TakeawayEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.isInPlayEvent = true;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = TakeawayEvent;
}