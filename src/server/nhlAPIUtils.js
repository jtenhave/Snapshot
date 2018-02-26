const httpUtils = require("./httpUtils");
const GameData = require("../common/data/GameData");

 /**
  * Downloads game data.
  */
module.exports.downloadGame = async function downloadGame(id) {
    const url = `http://statsapi.web.nhl.com/api/v1/game/${id}/feed/live`;
    const result = await httpUtils.download(url);
    return new GameData(result);
}

/**
 * Downloads game schedule. 
 */
module.exports.downloadSchedule = async function downloadInfo(dateString) {
    const url = `http://statsapi.web.nhl.com/api/v1/schedule?startDate=${dateString}&endDate=${dateString}`;
    const result = await httpUtils.download(url);

    // There will not be any dates if there are no games scheduled today.
    if (!result.dates || !result.dates.length) {
        return [];
    }

    return result.dates[0].games.map(rawGame => new GameData(rawGame));
}
