import { GameData } from "../../common/data/GameData";

/**
 * Download schedule data for particular day from the NHL API.
 */
export async function downloadSchedule(dateString) {
    const schedule = await download(`${window.location.protocol}/schedule?date=${dateString}`);
    return schedule.games.map(g => GameData.fromJSON(g));
}

/**
 * Download game data for a given game ID.
 */
export async function downloadGame(id) {
    return await download(`${window.location.protocol}/game?id=${id}`);
}

/**
 * Download data from a url.
 */
function download(url: string): any {
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
