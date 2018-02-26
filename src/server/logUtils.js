var jsLogging = require("js-logging");

let consoleLogger;
let fileLogger;
let logger = setupLogger();

/**
 * Configure logger for the server.
 */
function setupLogger(debug) {
	const options = {
		format: "${timestamp} <${title}> ${message}",
	    filters: {
            debug: "green",
	        info: "white",
	        warning: "yellow",
	        error: "red"
        },
        
        path: "./data/logs",
        filename: "snapshot",
        filenameDateFormat: "yyyy-mm-dd"
	};

	consoleLogger = jsLogging.console(options);
    fileLogger = jsLogging.dailyFile(options);

	return {
        debug: (message, e) => {
            message = formatMessage(message, e);
            consoleLogger.debug(message);
            fileLogger.debug(message);
        },

		info: (message) => {
            message = formatMessage(message);
            consoleLogger.info(message);
            fileLogger.info(message);
        },

        warning: (message, e) => {
            message = formatMessage(message, e);
            consoleLogger.warning(message);
            fileLogger.warning(message);
        },

        error: (message, e) => {
            message = formatMessage(message, e);
            consoleLogger.error(message);
            fileLogger.error(message);
        }
	}
}

function formatMessage(message, e) {
    if (e) {
        return `${message} ${e} + ${e.stack}`;
    }

    return message;
}

/**
 * Sets whether to debug or not.
 */
function setDebug(debug) {
    const level = debug ? "debug" : "info";
    consoleLogger.setLevel(level);
    fileLogger.setLevel(level);
}

module.exports.logger = logger;
module.exports.setDebug = setDebug;
