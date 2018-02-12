const timeUtils = require("../../../common/timeUtils");

/**
 * Class that represents an event in a game.
 */
class Event {

    constructor(rawData) {
        this.rawData = rawData;
        this.periodTime = timeUtils.toPeriodTime(rawData.about.periodTime);
        this.period = rawData.about.period;
        this.totalTime = timeUtils.toTotalTime(rawData.about.periodTime, this.period - 1);
        this.timestamp = new Date(rawData.about.dateTime).getTime();

        if (rawData.team) {
            this.team = rawData.team.triCode;
        }
    }

    /**
     * Finds a player in a event given a player type.
     */
    findPlayer(type) {
        const player = this.rawData.players.find(p => p.playerType === type);
        if (!player) {
            return undefined;
        }

        return player.player.id.toString();
    }

    /**
     * Finds players in a event given a player type.
     */
    findPlayers(type) {
        return this.rawData.players.filter(p => p.playerType === type).map(p => p.player.id.toString());
    }

    /**
     * Create an Event from an NHL API event.
     */
    static create(rawData) {
        throw new Error("Implemented in Event.js to avoid circular reference.");
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Event;
}
