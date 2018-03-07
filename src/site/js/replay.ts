import { DateUtils } from "../../common/DateUtils";
import { GameData } from "../../common/data/GameData";
import { ISyncSource } from "site/js/sync/ISyncSource";
import { PVRWebSocket } from "./sync/PVRWebSocket";
import * as $ from "jquery";
import * as mustache from "mustache";
import * as restUtils from "./restUtils";

const MINUTE = 60;
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
            syncSource.register(updateGameTime);
        }

        $("#snapshot-page-title").text("Replay Game");
        setupGameControls();
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
 * Update the period slider based on a timestamp from the sync source.
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
   slider.val(time || 0);
   slider[0].oninput(undefined);
}

/**
* Register event handlers for slider events.
*/
function registerSliderEvents() {
   const slider = $("#period-slider");
   const sliderChange = () => {
       var remaining = slider.prop("max") - <number>slider.val();
       var minutes = Math.floor(remaining / MINUTE);
       var seconds = remaining % MINUTE;
       $("#period-label").text(`${minutes}:${DateUtils.formatWithLeadingZero(seconds)}`);
   };

   slider[0].oninput = sliderChange;
   slider.prop("disabled", !!syncSource);
}
