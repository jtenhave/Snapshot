const Event = require("./_Event");

/**
 * Class that represents a missed shot event in a game.
 */
class MissedShotEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.shooter = this.findPlayer("Shooter");
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = MissedShotEvent;
}