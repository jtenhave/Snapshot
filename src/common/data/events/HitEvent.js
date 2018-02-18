const Event = require("./_Event");

/**
 * Class that represents a hit event in a game.
 */
class HitEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.isInPlayEvent = true;
        this.hitter = this.findPlayer("Hitter", rawData);
        this.hittee = this.findPlayer("Hittee", rawData);
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = HitEvent;
}