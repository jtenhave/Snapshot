/**
 * Class that represents data about a scheduled game.
 */
class GameInfo {

    constructor(rawData) {
        if (rawData) {
            this.id = rawData.gamePk.toString();
            this.date = new Date(rawData.gameDate);
            this.playoffs = rawData.gameType === "P";
            this.home = rawData.teams.home.team.name;
            this.away = rawData.teams.away.team.name;
            this.started = false;
        }     
    }

    /**
     * Converts game info to minified json.
     */
    toJSON() {
        return {
            _id: this.id,
            p: this.playoffs,
            h: this.home,
            a: this.away,
            s: this.started
        }
    }

    /**
     * Creates a GameInfo from a minified JSON object.
     */
    static fromJSON(json) {
        const gameInfo = new GameInfo();
        gameInfo.id = json._id;
        gameInfo.playoffs = json.p;
        gameInfo.home = json.h;
        gameInfo.away = json.a;
        gameInfo.started = json.s;

        return gameInfo;
    }
}

module.exports = GameInfo;