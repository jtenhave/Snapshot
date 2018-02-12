const Event = require("./_Event");

/**
 * Class that represents a goal event in a game.
 */
class GoalEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.scorer = this.findPlayer("Scorer");
        this.assistants = this.findPlayers("Assist");
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = GoalEvent;
}