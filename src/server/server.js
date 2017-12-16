var dateUtils = require("../common/dateUtils");
var express = require("express");
var gameUtils = require("./gameUtils");
var mongodb = require("mongodb");
var nodeScheduler = require('node-schedule');
var logger = require('./log');
var scheduleUtils = require("./scheduleUtils");

const DB_RETRY_INTERVAL = 5000;
const DB_RETRIES = 5;
const POLLING_INTERVAL = 15000;

setupServer();

/**
 * Setup the Snapshot server.
 */
async function setupServer() {
	logger.info("Starting Snapshot server.");
	var db = await connectToMongoDB();
	await setupNodeScheduler(db);
	await setupExpress(db);
	logger.info("Successfully started Snapshot server.");
}

/**
 * Connect to MongoDB.
 */
async function connectToMongoDB() {
	var url = 'mongodb://localhost:27017/snapshot';
	for (var i = 1; i <= DB_RETRIES; i++) {
		logger.info(`Connecting to MongoDB. Attempt: ${i}`);

		try {
            var db = await mongodb.MongoClient.connect(url);
            logger.info(`Successfully connected to MongoDB.`);
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
	var today = new Date();
	var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 1);
	logger.info(`Scheduling tomorrow's game data download for ${tomorrow}`);
	nodeScheduler.scheduleJob(tomorrow, () => setupNodeScheduler(database));

	var games = await getScheduleForDay(database, dateUtils.formatShortDate(today));
	if (!games.length) {
		return;
	}

	var startDates = games.map(g => g.date.getTime()).sort((a, b) => a - b);
	if (startDates.some(d => d < today.getTime())) {
		setupDataPolling(games, database);
	} else {
		var pollingTime =new Date(startDates[0]);
		logger.info(`No games on yet. Scheduling game data polling for ${pollingTime}`);
		nodeScheduler.scheduleJob(pollingTime, () => setupDataPolling(games, database));
	}
}

/**
 *  Setup periodic polling of game data.
 */
function setupDataPolling(games, database) { 
	logger.info(`Starting game data polling.`);
	
	var collection = database.collection('games');
	var pollingIntervalID = setInterval(async () => {
		var now = new Date(); 

		// Stop polling if all games are finished.
		if (games.every(g => g.finished)) {
			clearInterval(pollingIntervalID);
			logger.info("All games finished for today.");
			return;
		}

		for (let game of games) {
			if (game.date.getTime() > now.getTime() || game.finished) {
				continue;
			}

			try {
				var polledGameData = await gameUtils.download(game._id);
				game.finished = polledGameData.finished;
				await collection.updateOne({ _id : game._id }, { 
					$set: { 
						gameTime : polledGameData.gameTime, 
						started: polledGameData.gameTime.length > 0 
					}
				});
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
	var scheduleCollection = database.collection("schedule");
	var gamesCollection = database.collection("games");
	var games;

	try {
		var schedule = await scheduleCollection.findOne({ _id: dateString });
		if (schedule) {
			games = await gamesCollection.find({ _id : { "$in": schedule.games }})
				.project({ date: 1, playoffs: 1, home: 1, away: 1, started: 1 })
				.toArray();
		} else {
			logger.info(`Downloading game data for ${dateString}`);
			games = await scheduleUtils.download(dateString);
			await scheduleCollection.insertOne({ _id: dateString, games: games.map(g => g._id) })
			if (games.length > 0) {
				await gamesCollection.insertMany(games);
			}
			logger.info(`Downloaded game data for ${games.length} on ${dateString}`);	
		}
	} catch(e) {
		logger.error(e);
	}

	return games;
}

/**
 * Setup Express web server.
 */
function setupExpress(database) {
    var app = express();
	var collection = database.collection("games");

	// Setup time endpoint.
	app.get('/time', async (request, response) => {
		var id = request.query.id;
		var doc = await collection.findOne({ _id: id });
		if (doc) {
			response.set('Content-Type', 'application/json');
			response.send({ gameTime: doc.gameTime });
		} else {
			response.status(404).send(`Not found: ${id}`);
		}
	});

	app.get('/schedule', async (request, response) => {
		var date = request.query.date;
		var games = await getScheduleForDay(database, date);
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