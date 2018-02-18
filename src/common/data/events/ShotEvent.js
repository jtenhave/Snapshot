const Event = require("./_Event");

/**
 * Class that represents a shot event in a game.
 */
class ShotEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.isInPlayEvent = true;
        this.shooter = this.findPlayer("Shooter", rawData);
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = ShotEvent;
}