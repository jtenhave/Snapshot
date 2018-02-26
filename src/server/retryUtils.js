const logger = require("./logUtils").logger;

const RETRY_INTERVAL = 5000;
const RETRIES = 5;
const BACKOFF = 1.25;

/**
 * Retries an action until it succeeds. 
 */
async function retry(action, retries, interval, backoff) {
    retries = retries || RETRIES;
    interval = interval || RETRY_INTERVAL;
    backoff = backoff || BACKOFF;

    let error;

    for (let i = 1; i <= retries; i++) {
		try {
            return await action(i);
		} catch (e) {
            error = e;
			logger.warning(`Retry failed on attempt ${i}.`, e);
		}
		
        await sleep(interval);
        interval = interval * backoff;
    }
    
    if (error) {
        throw error;
    }
}

/**
 * Returns a promise that is resolved after a certain number of milliseconds.
 */
async function sleep (ms) {
	return new Promise((resolve, reject) => setTimeout(() => { resolve() }, ms));
}

module.exports.retry = retry;