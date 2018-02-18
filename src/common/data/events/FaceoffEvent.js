const Event = require("./_Event");

/**
 * Class that represents a faceoff event in a game.
 */
class FaceoffEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.isPlayStartEvent = true;
        this.winner = this.findPlayer("Winner", rawData);
        this.loser = this.findPlayer("Loser", rawData);
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = FaceoffEvent;
}