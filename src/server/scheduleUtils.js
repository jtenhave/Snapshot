var httpUtils = require('./httpUtils');

/**
 * Download data for games scheduled today.
 */
module.exports.download = async function download(dateString) {
	var url = `http://statsapi.web.nhl.com/api/v1/schedule?startDate=${dateString}&endDate=${dateString}`;

	var result = await httpUtils.download(url);
	return parseScheduleData(result);
}

/**
 * Parse schedule data from NHL API.
 */
function parseScheduleData(rawScheduleData) {

	// There will not be any dates if there are no games scheduled today.
	if (!rawScheduleData.dates.length) {
		return [];
	}

	return rawScheduleData.dates[0].games.map(game => {
		return {
			_id: game.gamePk.toString(),
			date: new Date(game.gameDate),
			playoffs: game.gameType === "P"
		}
	});
}
