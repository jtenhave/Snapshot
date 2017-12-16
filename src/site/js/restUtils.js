
/**
 * Download schedule data for particular day from the NHL API.
 */
async function downloadSchedule(dateString) {
    return await download(`${window.location.protocol}/schedule?date=${dateString}`);
}

/**
 * Download data from a url.
 */
function download(url) {
    return new Promise((resolve, reject) => {
		var request = new XMLHttpRequest();
		request.onload = () => { 
			resolve(JSON.parse(request.response));
		}
		request.onerror = () => {
			reject(JSON.parse(request.response));
		}

		request.open("GET", url, true);
		request.send();
	});
}
