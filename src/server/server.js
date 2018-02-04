const dateUtils = require("../common/dateUtils");
const express = require("express");
const GameData = require("./data/GameData");
const mongodb = require("mongodb");
const nodeScheduler = require('node-schedule');
const logger = require('./log');
const GameInfo = require("./data/GameInfo");

const DB_RETRY_INTERVAL = 5000;
const DB_RETRIES = 5;
const POLLING_INTERVAL = 15000;

setupServer();

/**
 * Setup the Snapshot server.
 */
async function setupServer() {
	logger.info("Starting Snapshot server.");
	const db = await connectToMongoDB();
	await setupNodeScheduler(db);
	await setupExpress(db);
	logger.info("Successfully started Snapshot server.");
}

/**
 * Connect to MongoDB.
 */
async function connectToMongoDB() {
	const url = 'mongodb://localhost:27017/snapshot';
	for (let i = 1; i <= DB_RETRIES; i++) {
		logger.info(`Connecting to MongoDB. Attempt: ${i}`);

		try {
            const db = await mongodb.MongoClient.connect(url);
            logger.info("Successfully connected to MongoDB.");
            return db;
		} catch (e) {
			logger.warning(e);
		}
		
		await sleep(DB_RETRY_INTERVAL);
	}

	logger.error("Failed to connect to MongoDB. Server exiting.");
}

/**
 * Setup node scheduler to download game data.
 */
async function setupNodeScheduler(database) {
	const today = new Date();
	const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 1);
	logger.info(`Scheduling tomorrow's game data download for ${tomorrow}`);
	nodeScheduler.scheduleJob(tomorrow, () => setupNodeScheduler(database));

	const games = await getScheduleForDay(database, dateUtils.formatShortDate(today));
	if (!games.length) {
		return;
	}

	// Check if any games have started yet. 
	const startDates = games.map(g => g.date.getTime()).sort((a, b) => a - b);
	if (startDates.some(d => d < today.getTime())) {
		setupDataPolling(games, database);
	} else {
		const pollingTime =new Date(startDates[0]);
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
	const pollingIntervalID = setInterval(async () => {
		const now = new Date(); 

		// Stop polling if all games are finished.
		if (games.every(g => g.finished)) {
			clearInterval(pollingIntervalID);
			logger.info("All games finished for today.");
			return;
		}

		for (let game of games) {
			// Only download data if the game is current on.
			if (game.date.getTime() > now.getTime() || game.finished) {
				continue;
			}

			try {
				const gameData = await GameData.download(game._id);
				if (game.lastGameData) {
					// TODO: Merge with last polled.
				}
				
				game.finished = gameData.finished;
				game.lastGameData = gameData;

				await gameDataCollection.replaceOne({ _id : game._id }, gameData.toJSON());
			} catch (e) {
				logger.error(e);
			}
		}
	}, POLLING_INTERVAL);
}

/**
 * Gets the list of games scheduled for today. Downloads from the NHL API if necessary.
 */
async function getScheduleForDay(database, dateString) {
	const now = new Date();
	const scheduleCollection = database.collection("schedule");
	const gameInfoCollection = database.collection("gameInfo");
	const gameDataCollection = database.collection("gameData");
	let gameInfos;

	try {
		const schedule = await scheduleCollection.findOne({ _id: dateString });
		if (schedule) {
			gameInfos = await gameInfoCollection.find({ _id : { "$in": schedule.games }}).toArray();
		} else {
			logger.info(`Downloading game data for ${dateString}`);
			gameInfos = await GameInfo.download(dateString);
			await scheduleCollection.insertOne({ _id: dateString, games: gameInfos.map(g => g._id) });
			if (gameInfos.length > 0) {
				for (const gameInfo of gameInfos) {
					// Download live data for games that might already be over.
					if (now.getTime() > gameInfo.date.getTime()) {
						const gameData = await GameData.download(gameInfo._id);
						gameInfo.started = gameData.started;

						await gameDataCollection.insertOne(gameData.toJSON());
					}
				}

				await gameInfoCollection.insertMany(gameInfos);
			}
			logger.info(`Downloaded game data for ${gameInfos.length} games on ${dateString}`);	
		}
	} catch(e) {
		logger.error(e);
	}

	return gameInfos;
}

/**
 * Setup Express web server.
 */
function setupExpress(database) {
    const app = express();
	const gameDataCollection = database.collection("gameData");

	// Setup game endpoint.
	app.get('/game', async (request, response) => {
		const id = parseInt(request.query.id);
		const doc = await gameDataCollection.findOne({ _id: id });
		if (doc) {
			response.set('Content-Type', 'application/json');
			response.send(doc);
		} else {
			response.status(404).send(`Not found: ${id}`);
		}
	});

	// Setup schedule endpoint.
	app.get('/schedule', async (request, response) => {
		const date = request.query.date;
		const games = await getScheduleForDay(database, date);
		response.set('Content-Type', 'application/json');
		response.send({ games: games });
	});

	// Setup static content for Snapshot site.
	app.use(express.static("src/site"));
	app.use(express.static("src/common"));

	return new Promise((resolve, reject) => {
		// Start web server.
		app.listen(8125, function () {
			logger.info('Running Snapshot web server.');
			resolve();
		});
	});
}

/**
 * Returns a promise that is resolved after a certain number of milliseconds.
 * @param ms Number of milliseconds to sleep.
 */
async function sleep (ms) {
	return new Promise((resolve, reject) => setTimeout(() => { resolve() }, ms));
}