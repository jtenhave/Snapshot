import { DateUtils } from "../../common/DateUtils";
import { TimeUtils } from "../../common/TimeUtils";
import { GameData } from "../../common/data/GameData";
import { ISyncSource } from "site/js/sync/ISyncSource";
import { PVRWebSocket } from "./sync/PVRWebSocket";
import * as $ from "jquery";
import * as mustache from "mustache";
import * as restUtils from "./restUtils";
import { PlayerSnapshot, Player } from "common/data/Player";
import { TeamSnapshot } from "common/data/Team";

const DOWNLOAD_MIN_INTERVAL: number = 30000;
const REDOWNLOAD_THRESHOLD: number = 120; // Two minutes
const periodNames = ["1st", "2nd", "3rd", "OT", "OT2", "OT3", "OT4", "OT5"];

let lastPeriod: number = 0;
let lastPeriodCount: number = 0;
let gameData : GameData;
let lastDownloadTime: Date;
let syncSource: ISyncSource;
let replayElement: JQuery<HTMLElement>;

// Retrieve the game ID from the URL query params.
const searchParams = new URLSearchParams(window.location.search);
const id = searchParams.get("game");

$(document).ready(async () => {
    // Display the loading icon
	replayElement = $("#replay-content");
    replayElement.html($("#content-loading-template").html());
    
    await downloadGameData();
    const date = new Date(gameData.date);
    (<any>gameData).startTime = `${DateUtils.formatLongDate(date)} ${DateUtils.formatTime(date)}`;

    $("#replay-matchup").html(mustache.render($("#matchup-template").html(), gameData));
    
    setupSyncPanel();
});

/**
 * Download the latest game data from the server.
 */
async function downloadGameData(): Promise<void> {
    lastDownloadTime = new Date();
    gameData = await restUtils.downloadGame(id);
}

/**
 * Synchronize Snapshot with a hockey game.
 */
async function sync(): Promise<void> {
    const value = $(`input[name="sync"]:checked`).val();
    const wsAddress = <string>$("#ws-address").val();

    // Display the loading icon
    replayElement.html($("#content-loading-template").html());

    try {
        switch (value) {
            case "pvr":
                syncSource = new PVRWebSocket(wsAddress);
                break;
            case "none":
                break;
        }

        if (syncSource) {
            await syncSource.connect();
            setupGameControls();
            syncSource.register(updateGameTime);
        } else {
            setupGameControls();
        }

        $("#snapshot-page-title").text("Replay Game");
    } catch(e) {
        setupSyncPanel(e, wsAddress);
        syncSource = undefined;
    }
}

/** 
 * Setups the sync panel.
 */
function setupSyncPanel(error?: Error, wsAddress?: string) {
    replayElement.html($("#snapshot-sync-template").html());
    if (error) {
        $("#sync-error").text(`Failed to sync: ${error.message}`);
    }

    if (wsAddress) {
        $("#ws-address").val(wsAddress);
    }

    $("#sync-button").click(sync);
}

/**
 * Update the game controls based on a timestamp from the sync source.
 */
async function updateGameTime(timestamp) {
   const gameTime = gameData.calculateGameTime(timestamp);
   const now = new Date();

   // Check if the game data needs to be downloaded again.
   if (gameData.time - gameTime.totalTime < REDOWNLOAD_THRESHOLD && (now.getTime() - lastDownloadTime.getTime()) > DOWNLOAD_MIN_INTERVAL) { 
       await downloadGameData();
   }

   setupPeriodCombo(gameTime.period);
   setupPeriodSlider(gameTime.time);
   updateStatsTable();
}

/**
 * Setup the stats table with team selector.
 */
function setupStatsTable() {
    const table = $("#stats-table");
    const template = $("#team-stats-row-template").html();

    table.append(mustache.render(template, gameData));
    const awayButton = $("#away-team-button");
    const homeButton = $("#home-team-button");

    let selected = awayButton;
    $("#selected-team").text(gameData.teams.away.name);
    updateStatsTable();

    const click = (s) => {
        if (s === selected) {
            return;
        }

        const newSelected = selected === awayButton ? homeButton : awayButton;
        newSelected.toggleClass("team-button");
        newSelected.toggleClass("team-button-selected");

        selected.toggleClass("team-button-selected");
        selected.toggleClass("team-button");
        selected = newSelected;

        const team = selected === awayButton ? gameData.teams.away : gameData.teams.home;
        $("#selected-team").text(team.name);
        updateStatsTable();
    };

    awayButton.click(() => click(awayButton));
    homeButton.click(() => click(homeButton));
}

/**
 * Update the data in the stats table.
 */
function updateStatsTable() {
    const team = $("#away-team-button").hasClass("team-button-selected") ? gameData.teams.away : gameData.teams.home;
    
    // Update the team stats
    const snapshot = team.createSnapshot(getGameTime());
    $("#team-goals").text(snapshot.goals);
    $("#team-shots").text(snapshot.shots);
    $("#team-faceoffs").text(snapshot.faceoffPercent);
    $("#team-hits").text(snapshot.hits);

    const table = $("#stats-table");
    table.find("tr:gt(0)").remove();
    
    const template = $("#player-stats-row-template").html();
    const skaterTemplate = $("#skater-divider-row-template").html();
    const goalieTemplate = $("#goalie-divider-row-template").html();

    let defenceBreak = false;
    let goalieBreak = false;
    const sortedPlayers = snapshot.players.sort((a, b) => rankPlayer(a) - rankPlayer(b));
    let highlight = 0;

    table.append(mustache.render(skaterTemplate, { skater: "Forwards"}));
    for (let player of sortedPlayers) {
        if (!defenceBreak && player.position === "D") {
            table.append(mustache.render(skaterTemplate, { skater: "Defence"}));
            defenceBreak = true;
            highlight = 0;
        }

        if (!goalieBreak && player.position === "G") {
            table.append(mustache.render(goalieTemplate));
            goalieBreak = true;
            highlight = 0;
        }

        const playerTemplate = { ...player, background: highlight % 2 != 0 ? "#C8C8C8" : "#FFFFFF"};
        if (goalieBreak) {
            const shots = playerTemplate.shots;
            const blocks = playerTemplate.blocks;

            playerTemplate.goals = shots > 0 ? <any>(blocks / shots).toFixed(3).toString() : "-";
            playerTemplate.assists = shots - blocks;
        }

        const row = mustache.render(template, playerTemplate);
        highlight++;
        table.append(row);
    }
}

/**
 * Create a number that can be used to sort a player.
 */
function rankPlayer(player: PlayerSnapshot) {
    if (player.position === "C" || player.position === "R" || player.position === "L") {
        return player.number;
    } else if (player.position === "D") {
        return 100 + player.number;
    } else {
        return 200 + player.number;
    }
}

/**
 * Setup the period combo box and slider.
 */
function setupGameControls() {
   replayElement.html($("#replay-template").html());
   const period = $("#period-combo");
   period.prop("disabled", !!syncSource);
   period.change(e => {
       setupPeriodSlider(0);
   });

   setupPeriodCombo();
   setupPeriodSlider(); 
   setupStatsTable();
}

/**
 * Setup the values of the period combo box.
 */
function setupPeriodCombo(period?: number): void {
    const periodCombo = $("#period-combo");
    const periods = gameData.periodCount;
    if (periods > lastPeriodCount) {
        for (let i = lastPeriodCount; i < periods; i++) {
            const opt = $("<option></option>");
            opt.attr("value", i + 1);
            opt.text(periodNames[i]);
            periodCombo.append(opt);
        }
    }

    if (period) {
        periodCombo.val(period);
    }

    lastPeriodCount = periods;
}

/**
 * Setup the period slider. Display an OT slider if needed.
 */
function setupPeriodSlider(time?: number) {
   const period = $("#period-combo");
   const currentPeriod = parseInt(<string>period.val());

   // Setup a full period slider if needed.
   if (lastPeriod === 0 || (lastPeriod > 3 && currentPeriod <= 3)) {
       $("#period-range-container").html($("#full-period-slider").html());
       registerSliderEvents();
   }

   // Setup the five minute overtime slider if needed.
   if (!gameData.playoffs && lastPeriod <= 3 && currentPeriod > 3) {
       $("#period-range-container").html($("#ot-period-slider").html());
       registerSliderEvents();
   }

   lastPeriod = currentPeriod;

   const slider = $("#period-slider");
   var current = slider.val();
   slider.val(time || 0);
   slider[0].oninput(undefined);
}

/**
 * Register event handlers for slider events.
 */
function registerSliderEvents() {
    const slider = $("#period-slider");
    const sliderChange = () => {
        let remaining = slider.prop("max") - <number>slider.val();
        let minutes = Math.floor(remaining / TimeUtils.MINUTE);
        let seconds = remaining % TimeUtils.MINUTE;
        $("#period-label").text(`${minutes}:${DateUtils.formatWithLeadingZero(seconds)}`);
    };

    slider[0].oninput = sliderChange;
    slider[0].onchange = () => updateStatsTable();

    slider.prop("disabled", !!syncSource);
}

/**
 * Gets the current time from game controls.
 */
function getGameTime() {
    const periodCombo = $("#period-combo");
    const slider = $("#period-slider");

    const period = parseInt(<string>periodCombo.find('option:selected').val());
    const time = $("#period-label").text();

    return TimeUtils.toTotalTime(time, period - 1, true, !gameData.playoffs && period === 4);
}
