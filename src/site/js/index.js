const scheduleCache = new Map();
let lastDate;
let scheduleRowTemplate;

/**
 * Initialization to do when the page is loaded.
 */
async function init() {
	scheduleRowTemplate =  $("#schedule-table-row-template").html();
	
	const date = formatShortDate(new Date());
	const dateInput = $("#date-input");
	const change = e => { 
		if (!dateInput[0].validity.badInput) {
			updateScheduleData(e.target.value);
		}
	};

	dateInput.change(change);
	dateInput.click(change);
	dateInput.val(date);
	await updateScheduleData(date);
}

/**
 * Update the schedule table with the games for the selected date.
 */
async function updateScheduleData(dateString) {
	if (lastDate === dateString) {
		return;
	}

	$("#date-label").text(formatLongDate(new Date(dateString)));

	lastDate = dateString;

	// Display the loading icon 
	const table = $("#schedule-table");
	table.html($("#content-loading-template").html());

	// Download game data if needed.
	if (!scheduleCache.has(dateString)) {
		const schedule = await downloadSchedule(dateString);
		scheduleCache.set(dateString, schedule);
	}

	table.empty();

	const games = scheduleCache.get(dateString).games;
	if (games.length > 0) {
		for (const game of games) {
			if (!game.time) {
				game.time = formatTime(new Date(game.date))
			}

			// Format the row template with the game data.
			table.append(Mustache.render(scheduleRowTemplate, game));
		}
	} else {
		table.text("NO GAMES SCHEDULED");
	}
}
