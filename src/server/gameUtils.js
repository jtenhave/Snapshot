var httpUtils = require('./httpUtils');

const MILLISECONDS = 1000;
const PERIOD_LEN = 1200;
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
	gameData.teamStats = parseTeamStats(rawGameData);
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

function parseTeamStats(rawGameData) {
	
	// Basic team information
	const teams = {};

	try {

		const away = createTeamData(rawGameData.gameData.teams.away.name);
		const home = createTeamData(rawGameData.gameData.teams.home.name);

		teams[rawGameData.gameData.teams.away.id] = away;
		teams[rawGameData.gameData.teams.home.id] = home;

		const opposition = team => team === home ? away: home;
		
		// Basic player information.
		for (var playerId of Object.keys(rawGameData.gameData.players)) {
			const player = rawGameData.gameData.players[playerId];
			teams[player.currentTeam.id].players[player.id] = { 
				name: player.fullName,
				goals: [],
				assists: [],
				shots: [],
				faceoffWin: [],
				faceoffLoss: [],
				hits: []
			}
		}
	
		// Parse all events
		for (var event of rawGameData.liveData.plays.allPlays) {
			const time = toTotalTime(event);
	
			// Shot event.
			if (event.result.event === "Shot") {
				const team = teams[event.team.id];
				const shooter = event.players.find(p => p.playerType == "Shooter").player;
				team.players[shooter.id].shots.push(time);
			}

			// Goal event.
			if (event.result.event === "Goal") {
				const team = teams[event.team.id];
				const scorer = event.players.find(p => p.playerType == "Scorer").player;
				const assistants = event.players.filter(p => p.playerType == "Assist").map(p => p.player);
				for (const assistant of assistants) {
					team.players[assistant.id].assists.push(time);
				}

				const player = team.players[scorer.id];
				player.goals.push(time);

				// Goal is also a shot.
				player.shots.push(time);
			}

			// Faceoff event.
			if (event.result.event === "Faceoff") {
				const team = teams[event.team.id];
				const otherTeam = opposition(team);

				const winner = event.players.find(p => p.playerType == "Winner").player;
				const loser = event.players.find(p => p.playerType == "Loser").player;
				
				team.players[winner.id].faceoffWin.push(time);
				otherTeam.players[loser.id].faceoffLoss.push(time);
			}

			// Hit event.
			if (event.result.event === "Hit") {
				const team = teams[event.team.id];
				const hitter = event.players.find(p => p.playerType == "Hitter").player;
				team.players[hitter.id].hits.push(time);
			}
		}	
	} catch(e) {
		console.log(e);
	}

	return teams;
}

function createTeamData(name) {
	return {
		name: name,
		players: {}
	}
}

/**
 * Convert a time in format "mm:SS" to a number of seconds.
 */
function toPeriodTime(time) {
	var periodTime = time.split(":").map(t => parseInt(t));
	return periodTime[0] * 60 + periodTime[1];
}

function toTotalTime(event) {
	return (event.about.period - 1) * PERIOD_LEN + toPeriodTime(event.about.periodTime);
}
