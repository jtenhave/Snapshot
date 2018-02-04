const httpUtils = require('../httpUtils');

/**
 * Class that represents basic info about a game.
 */
class GameInfo {

    /**
     * Downloads game info. 
     */
    static async download(dateString) {
        const url = `http://statsapi.web.nhl.com/api/v1/schedule?startDate=${dateString}&endDate=${dateString}`;
        const result = await httpUtils.download(url);

        // There will not be any dates if there are no games scheduled today.
        if (!result.dates.length) {
            return [];
        }
    
        return result.dates[0].games.map(game => GameInfo.fromRawData(game));
    }

    /**
     * Converts raw game info from the NHL api to a GameInfo object.
     */
    static fromRawData (rawData) {
        var gameInfo = new GameInfo();
        gameInfo._id = rawData.gamePk.toString();
        gameInfo.date = new Date(rawData.gameDate);
        gameInfo.playoffs = rawData.gameType === "P";
        gameInfo.home = rawData.teams.home.team;
        gameInfo.away = rawData.teams.away.team;
        gameInfo.started = false;

        return gameInfo;
    }
}

module.exports = GameInfo;
