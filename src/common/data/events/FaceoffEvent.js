const Event = require("./_Event");

/**
 * Class that represents a faceoff event in a game.
 */
class FaceoffEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.winner = this.findPlayer("Winner");
        this.loser = this.findPlayer("Loser");
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = FaceoffEvent;
}