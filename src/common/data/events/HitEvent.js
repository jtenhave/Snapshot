const Event = require("./_Event");

/**
 * Class that represents a hit event in a game.
 */
class HitEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.hitter = this.findPlayer("Hitter");
        this.hittee = this.findPlayer("Hittee");
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = HitEvent;
}