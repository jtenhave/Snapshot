const httpUtils = require('../httpUtils');
const Play = require("./Play");
const timeUtils = require("../../common/timeUtils");

const playEvents = ["Faceoff"];
const stoppageEvents = ["Goal", "Period End", "Stoppage"];
const liveEvents = ["Shot", "Missed Shot", "Giveaway", "Blocked Shot", "Takeaway", "Hit"];

/**
 * Class that represents advanced data about a game.
 */
class GameData {

    /**
     * Downloads game data.
     */
    static async download(id) {
        const url = `http://statsapi.web.nhl.com/api/v1/game/${id}/feed/live`;
        const result = await httpUtils.download(url);
        return GameData.fromRawData(result);
    }

    /**
     * Converts raw game data from the NHL api to a GameData object.
     */
    static fromRawData (rawData) {
        const gameData = new GameData();
        gameData._id = rawData.gamePk;
        gameData.finished = rawData.gameData.status.statusCode === "7";
        gameData.playoffs = rawData.gameData.game.type === "P";
        gameData.parseGameEvents(rawData);

        return gameData;
    }

    /**
     * Indicates if an event is a live event (i.e. occurs between a faceoff and a whistle).
     */
    static isLiveEvent (event) {
        return liveEvents.includes(event.result.event)
    }

    /**
     * Indicates if an event is a whistle event.
     */
    static isStoppageEvent (event) {
        return stoppageEvents.includes(event.result.event)
    }

    /**
     * Indicates if an event is a faceoff.
     */
    static isPlayEvent (event) {
        return playEvents.includes(event.result.event)
    }

    /**
     * Parses events from raw game data from the NHL API.
     */
    parseGameEvents (rawData) {
        this.plays = [];

        let play;
        for (let event of rawData.liveData.plays.allPlays) {
            // Do not parse events that are beyond overtime.
            if (!this.playoffs && event.about.period >= 5) {
                continue;
            }

            const isPlayEvent = GameData.isPlayEvent(event);

            // Data from NHL API won't always have stoppage events.
            if (play && (GameData.isStoppageEvent(event) || isPlayEvent)) {
                // There can be multiple stoppage events in a row.
                play.stop(event, !isPlayEvent);
                play = undefined;
            }

            if (!play) {
                const lastPlay = this.plays[this.plays.length - 1];

                // Data from NHL API won't always have faceoff events.
                const abruptStart = (GameData.isLiveEvent(event) && lastPlay.end !== timeUtils.toSeconds(event.about.periodTime));
                if (isPlayEvent || abruptStart) {
                    play = Play.start(event);
                    this.plays.push(play);
                }
            }
        }

        this.started = this.plays.length > 0;
    }

    /**
     * Converts game data to minified json.
     */
    toJSON() {
        return {
            _id: this._id,
            plays: this.plays.map(p => p.toJSON())
        }
    }
}

module.exports = GameData;
