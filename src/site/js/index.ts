import { DateUtils } from "../../common/DateUtils";
import * as $ from "jquery";
import * as restUtils from "./restUtils";
import * as mustache from "mustache";
import { GameData } from "common/data/GameData";

const scheduleCache = new Map<string, GameData[]>();
let lastDate;
let scheduleRowTemplate;

$(document).ready(() => {
    scheduleRowTemplate =  $("#schedule-table-row-template").html();
	
	const date = DateUtils.formatShortDate(new Date());
	const dateInput = <any>$("#date-input");
	const change = e => { 
		if (!dateInput[0].validity.badInput) {
			updateScheduleData(e.target.value);
		}
	};

	dateInput.change(change);
	dateInput.click(change);
	dateInput.val(date);
	updateScheduleData(date);
});

/**
 * Update the schedule table with the games for the selected date.
 */
async function updateScheduleData(dateString) {
	if (lastDate === dateString) {
		return;
	}

	var dateParts = dateString.split(/\D/);
	var date = new Date(dateParts[0], dateParts[1]-1, dateParts[2]);

	$("#date-label").text(DateUtils.formatLongDate(date));

	lastDate = dateString;

	// Display the loading icon 
	const table = $("#schedule-table");
	table.html($("#content-loading-template").html());

	// Download game data if needed.
	if (!scheduleCache.has(dateString)) {
		const schedule = await restUtils.downloadSchedule(dateString);
		scheduleCache.set(dateString, schedule);
	}

	table.empty();

	const games = scheduleCache.get(dateString);
	if (games.length > 0) {
		for (const game of games) {
			if (!(<any>game).startTime) {
				(<any>game).startTime = DateUtils.formatTime(new Date(game.date))
			}

			// Format the row template with the game data.
			table.append(mustache.render(scheduleRowTemplate, game));
		}
	} else {
		table.text("NO GAMES SCHEDULED");
	}
}
