const express = require("express");
const mongodb = require("mongodb");
const nodeScheduler = require('node-schedule');

const DateUtils = require("../common/DateUtils").DateUtils;
const GameData = require("../common/data/GameData").GameData;
const httpUtils = require("./httpUtils");
const nhlAPIUtils = require("./nhlAPIUtils");
const logUtils = require("./logUtils");
const retryUtils = require("./retryUtils");

const logger = logUtils.logger;

const POLLING_INTERVAL = 15000;
const SERVER_PORT = 80;

setupServer();

/**
 * Setup the Snapshot server.
 */
async function setupServer() {
	const args = getCommandLineArgs();
	logger.info(`Starting Snapshot server.`);
	logUtils.setDebug(args.debug);
	httpUtils.setDebug(args.debug);

	const db = await connectToMongoDB();
	if (!db) {
		return;
	}

	await setupPollingScheduler(db);
	await setupExpress(db);
	logger.info("Successfully started Snapshot server.");
}

/**
 * Connect to MongoDB.
 */
async function connectToMongoDB() {
	const url = 'mongodb://localhost:27017/snapshot';

	const connect = async (i) => {
		logger.info(`Connecting to MongoDB. Attempt: ${i}`);
		const db = await mongodb.MongoClient.connect(url);
		logger.info("Successfully connected to MongoDB.");
		return db;
	};

	try {
		return await retryUtils.retry(connect);
	}
	catch(e) {
		logger.error("Failed to connect to MongoDB. Server exiting.", e);
	}
}

/**
 * Setup node scheduler to download game data.
 */
async function setupPollingScheduler(database) {
	const today = new Date();
	const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 1);
	logger.info(`Scheduling tomorrow's schedule download for ${tomorrow}`);
	nodeScheduler.scheduleJob(tomorrow, () => setupPollingScheduler(database));

	let games;
	try {
		games = await getScheduleForDay(database, DateUtils.formatShortDate(today), true);
	} catch(e) {
		logger.error(`Failed to download schedule for ${today}.`, e);
	}
	
	if (!games || !games.length) {
		return;
	}

	// Check if any games have started yet. 
	const startDates = games.map(g => g.date.getTime()).sort((a, b) => a - b);
	if (startDates.some(d => d < today.getTime())) {
		setupDataPolling(games, database);
	} else {
		const pollingTime = new Date(startDates[0]);
		logger.info(`No games on yet. Scheduling game data polling for ${pollingTime}`);
		nodeScheduler.scheduleJob(pollingTime, () => setupDataPolling(games, database));
	}
}

/**
 *  Setup periodic polling of game data.
 */
function setupDataPolling(games, database) { 
	logger.info(`Starting game data polling.`);
	const gameDataCollection = database.collection("gameData");
	
	const gameMap = {};
	for (const game of games) {
		gameMap[game.id] = game;
	}

	const pollingIntervalID = setInterval(async () => {
		logger.debug("Polling game data.");
		const now = new Date(); 

		// Stop polling if all games are finished.
		if (Object.keys(gameMap).every(k => gameMap[k].finished)) {
			clearInterval(pollingIntervalID);
			logger.info("All games finished for today.");
			return;
		}

		for (const gameId of Object.keys(gameMap)) {
			const currentGameData = gameMap[gameId];

			// Only download data if the game is currently on.
			if (currentGameData.date.getTime() > now.getTime() || currentGameData.finished) {
				continue;
			}

			try {
				const gameData = await nhlAPIUtils.downloadGame(gameId);
				gameData.merge(currentGameData);		
				gameMap[gameId] = gameData;

				await gameDataCollection.replaceOne({ _id : gameId }, gameData.toJSON());

				if (gameData.finished) {
					logger.info(`Game Finished: ${gameData.teams.away.name} at ${gameData.teams.home.name}`);
				}
			} catch (e) {
				logger.error("Error during data polling.", e);
			}
		}
	}, POLLING_INTERVAL);
}

/**
 * Gets the list of games scheduled for today. Downloads from the NHL API if necessary.
 */
async function getScheduleForDay(database, dateString, forceDownload) {
	const scheduleCollection = database.collection("schedule");
	const gameDataCollection = database.collection("gameData");

	if (!forceDownload) {
		const schedule = await scheduleCollection.findOne({ _id: dateString });
		if (schedule) {
			let games = await gameDataCollection.find({ _id : { "$in": schedule.games }}).toArray();
			return games.map(g => GameData.fromJSON(g, true));
		}
	}
	
	const gameData = await retryUtils.retry(async (i) => await downloadScheduleForDay(dateString));

	// Don't insert anything if the download fails.
	await scheduleCollection.replaceOne({ _id : dateString }, { _id: dateString, games: gameData.map(g => g.id) }, { upsert: true });
	
	const gameDataJson = gameData.map(g => g.toJSON());
	for (var json of gameDataJson) {
		gameDataCollection.replaceOne({ _id: json._id}, json, { upsert: true });
	}
	
	return gameData;
}

/**
 * Downloads schedule data from the NHL API.
 */
async function downloadScheduleForDay(dateString) {
	const now = new Date();
	const gameData = [];
	logger.info(`Downloading schedule data for ${dateString}.`);
	const scheduleData = await nhlAPIUtils.downloadSchedule(dateString);
	if (scheduleData.length > 0) {
		// Download live data for games that might already be over.
		for (const data of scheduleData) {
			if (now.getTime() > data.date.getTime()) {
				logger.debug(`Downloading game data for started game: ${data.teams.away.name} at ${data.teams.home.name} .`);
				const liveData = await nhlAPIUtils.downloadGame(data.id);
				gameData.push(liveData);
			} else {
				gameData.push(data);
			}
		}
	}

	logger.info(`Downloaded game data for ${gameData.length} games on ${dateString}`);
	return gameData;
}

/**
 * Returns the command line arguments passed to the server.
 */
function getCommandLineArgs() {
	return { 
		debug: process.argv.indexOf("--debug") >= 0 || process.argv.indexOf("-d") >= 0
	}
}

/**
 * Setup Express web server.
 */
function setupExpress(database) {
    const app = express();
	const gameDataCollection = database.collection("gameData");

	// Setup game endpoint.
	app.get('/game', async (request, response) => {
		try {
			const id = request.query.id;
			const doc = await gameDataCollection.findOne({ _id: id });
			if (doc) {
				response.set('Content-Type', 'application/json');
				response.send(doc);
			} else {
				response.status(404).send(`Not found: ${id}`);
			}
		} catch (e) {
			logger.error("Game endpoint error. ", e);
			responses.status(500).send("Internal server error.");
		}
	});

	// Setup schedule endpoint.
	app.get('/schedule', async (request, response) => {
		try {
			const date = request.query.date;
			let games = await getScheduleForDay(database, date);

			response.set('Content-Type', 'application/json');
			response.send({ games: games });
		} catch (e) {
			logger.error("Schedule endpoint error. ", e);
			response.status(500).send("Internal server error.");
		}
	});

	// Setup static content for Snapshot site.
	app.use(express.static("dist/site"));
	app.use("/common", express.static("dist/common"));
	app.use(express.static("dist/libs"));

	return new Promise((resolve, reject) => {
		// Start web server.
		app.listen(SERVER_PORT, function () {
			logger.info('Running Snapshot web server.');
			resolve();
		});
	});
}
