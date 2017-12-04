var express = require("express");
var jsLogging = require('js-logging');
var mongodb = require("mongodb");

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
    await connectToMongoDB();
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