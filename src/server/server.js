var express = require("express");
var jsLogging = require('js-logging');
var mongodb = require("mongodb");
var nodeScheduler = require('node-schedule');
var scheduleUtils = require("./scheduleUtils");

const DB_RETRY_INTERVAL = 5000;
const DB_RETRIES = 5;

const logger = setupLogger();
setupServer();

/**
 * Configure logger for the server.
 */
function setupLogger() {
	var options = {
		format: "${timestamp} <${title}> ${message}",
	    filters: {
	        info: "white",
	        warning: "yellow",
	        error: "red"
	    }
	};
	return jsLogging.console(options);
}

/**
 * Setup the Snapshot server.
 */
async function setupServer() {
	var db = await connectToMongoDB();
	await setupNodeScheduler(db);
    setupExpress();
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
	nodeScheduler.scheduleJob(tomorrow, () => setupScheduler(database));

	logger.info("Downloading today's game data");
	var games = await scheduleUtils.download();
	logger.info(`Downloaded data for the ${games.length} games today.`);

	if (!games.length) {
		return;
	}

	// Insert game data into MongoDB
	var collection = database.collection('games');
	try {
		await collection.insertMany(games);
	} catch (e) {
		logger.error(e);
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

}

/**
 * Setup Express web server.
 */
function setupExpress() {
    var app = express();
    
	// Start web server.
	app.listen(8125, function () {
	  logger.info('Running Snapshot server');
	});
}

/**
 * Returns a promise that is resolved after a certain number of milliseconds.
 * @param ms Number of milliseconds to sleep.
 */
async function sleep (ms) {
	return new Promise((resolve, reject) => setTimeout(() => { resolve() }, ms));
}