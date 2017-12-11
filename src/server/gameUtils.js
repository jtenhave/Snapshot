var httpUtils = require('./httpUtils');

const MILLISECONDS = 1000;
const playEvents = ["Faceoff"];
const stoppageEvents = ["Goal", "Period End", "Stoppage"];

/**
 * Download data for particular game id.
 */
module.exports.download = async function download(id) {
	var url = `http://statsapi.web.nhl.com/api/v1/game/${id}/feed/live`;

	var result = await httpUtils.download(url);
	return parseGameData(result);
}

/**
 * Parse game data from NHL API.
 */
function parseGameData(rawGameData) {
	var gameData = {};
	gameData.finished = rawGameData.gameData.status.statusCode === "7";
	gameData.playoffs = rawGameData.gameData.game.type === "P";

	gameData.gameTime = parseGameTime(rawGameData, gameData.playoffs);
	// TODO Parse more stats here.

	return gameData;
}

/**
 * Parse game time data from NHL API.
 */
function parseGameTime(rawGameData, playoffs) {
	var encodedGameTime = [];
	var inPlay = false;

	for (var event of rawGameData.liveData.plays.allPlays) {
		// Do not parse events that are beyond overtime.
		if (!playoffs && event.about.period >= 5) {
			continue;
		}

		// Stop the current play.
		var stopPlay = function(missingStoppageEvent) {
			inPlay = false;
			var play = encodedGameTime[encodedGameTime.length - 1];
			play.e = toPeriodTime(event.about.periodTime);
			play.et = new Date(event.about.dateTime).getTime();

			// Reset the start time based on the end time. We have to do this because timestamps from the
			// NHL API are not accurate.
			var elapsed = play.e - play.s;
			play.st = play.et - elapsed * MILLISECONDS;

			if (missingStoppageEvent) {
				play.missingStoppage = true;
			}
		};

		// Data from NHL API won't always have stoppage events.
		if ((playEvents.includes(event.result.event) && inPlay) ) {
			stopPlay(true);
		} else if (stoppageEvents.includes(event.result.event)) {
			stopPlay();
		}

		// Start a new play.
		if (playEvents.includes(event.result.event)) {
			inPlay = true;
			encodedGameTime.push({
				s: toPeriodTime(event.about.periodTime),
				st: new Date(event.about.dateTime).getTime(),
				p: event.about.period 
			});
		}
	}

	return encodedGameTime;
}

/**
 * Convert a time in format "mm:SS" to a number of seconds.
 */
function toPeriodTime(time) {
	var periodTime = time.split(":").map(t => parseInt(t));
	return periodTime[0] * 60 + periodTime[1];
}
