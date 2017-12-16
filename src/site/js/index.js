var lastDate;
var scheduleCache = new Map();

async function init() {
	const date = formatShortDate(new Date());

	const dateInput = document.querySelector("#date-input");
	dateInput.onchange = dateInput.onclick = e => updateScheduleData(e.target.value);
	dateInput.value = date;
	await updateScheduleData(date);
}

/**
 * Update the schedule table with the games for the selected date.
 */
async function updateScheduleData(dateString) {
	if (lastDate === dateString) {
		return;
	}

	document.querySelector("#date-label").textContent = formatLongDate(new Date(dateString));

	lastDate = dateString;

	// Display the loading icon 
	var table = document.querySelector("#schedule-table");
	table.innerHTML = `<img class="content-loading" src="images/content-loading.png"></img>`;

	// Download game data if needed.
	if (!scheduleCache.has(dateString)) {
		const schedule = await downloadSchedule(dateString);
		scheduleCache.set(dateString, schedule);
	}

	table.removeChild(table.lastChild);

	var games = scheduleCache.get(dateString).games;
	if (games.length > 0) {
		for (const game of games) {
			var tr = createTableRow(game);
			table.appendChild(tr);
		}
	} else {
		table.textContent = `NO GAMES SCHEDULED`;
	}
}

/**
 * Create a row in the schedule table.
 */
function createTableRow(game) {
   	var tr = document.querySelector("#schedule-table-row"),
	td = tr.content.querySelectorAll("td");
	
	td[0].innerHTML = `<div class="matchup-content">
							<img class="logo" src="images/teams/${game.away.id}.png"></img>
							 ${game.away.name} @ 
							<img class="logo" src="images/teams/${game.home.id}.png"></img> ${game.home.name}
						</div>`;
						
	td[1].textContent = formatTime(new Date(game.date));
	if (game.started) {
		td[2].innerHTML = `<a href="/replay.html?game=${game._id}">REPLAY</a>`;
	} else {
		td[2].textContent = "NOT AVAILABLE";
	}

	return document.importNode(tr.content, true);
}
