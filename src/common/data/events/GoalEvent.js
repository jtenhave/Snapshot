const Event = require("./_Event");

/**
 * Class that represents a goal event in a game.
 */
class GoalEvent extends Event {
    
    constructor(rawData) {
        super(rawData);

        this.isPlayStopEvent = true;
        this.scorer = this.findPlayer("Scorer", rawData);
        this.assistants = this.findPlayers("Assist", rawData);
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = GoalEvent;
}