const Event = require("./_Event");

/**
 * Class that represents a blocked shot event in a game.
 */
class BlockedShotEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.shooter = this.findPlayer("Shooter");
        this.blocker = this.findPlayer("Blocker");
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = BlockedShotEvent;
}