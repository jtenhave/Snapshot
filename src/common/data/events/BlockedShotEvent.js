const Event = require("./_Event");

/**
 * Class that represents a blocked shot event in a game.
 */
class BlockedShotEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.isInPlayEvent = true;
        this.shooter = this.findPlayer("Shooter", rawData);
        this.blocker = this.findPlayer("Blocker", rawData);
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = BlockedShotEvent;
}