var jsLogging = require('js-logging');

module.exports = setupLogger();

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
        },
        
        path: "./data/logs",
        filename: "snapshot",
        filenameDateFormat: "yyyy-mm-dd"
	};

	var consoleLogger = jsLogging.console(options);
	var fileLogger = jsLogging.dailyFile(options);

	return {
		info: (message) => {
            consoleLogger.info(message);
            fileLogger.info(message);
        },

        warning: (message) => {
            consoleLogger.warning(message);
            fileLogger.warning(message);
        },

        error: (message) => {
            consoleLogger.error(message);
            fileLogger.error(message);
        }
	}
}
