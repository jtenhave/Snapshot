const Event = require("./_Event");

/**
 * Class that represents a giveaway event in a game.
 */
class GiveawayEvent extends Event {
    
    constructor(rawData) {
        super(rawData);
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = GiveawayEvent;
}