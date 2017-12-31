const PERIOD_LEN = 1200;
const MILLISECONDS = 1000;
const MINUTE = 60;
const DOWNLOAD_MIN_INTERVAL = 30000;
const REDOWNLOAD_THRESHOLD = 120; // Two minutes
const periodNames = ["1st", "2nd", "3rd", "OT", "OT2", "OT3", "OT4", "OT5"];

let gameData;
let replayElement;
let syncSource;
let lastPeriod = 0;
let lastDownloadTime;
let lastPeriodCount = 0;

const searchParams = new URLSearchParams(window.location.search);
const id = searchParams.get("game");

/**
 * Initialization to do when the page is loaded.
 */
async function init() {

    // Display the loading icon 
	replayElement = $("#replay-content");
    replayElement.html($("#content-loading-template").html());
    
    await downloadGameData();
    const date = new Date(gameData.date);
    gameData.time = `${formatLongDate(date)} ${formatTime(date)}`;

    $("#replay-matchup").html(Mustache.render($("#matchup-template").html(), gameData));
    replayElement.html($("#snapshot-sync-template").html());
}

/**
 * Download the latest game data from the server.
 */
async function downloadGameData() {
    lastDownloadTime = new Date();
    gameData = await downloadGame(id);
}

/**
 * Synchronize Snapshot with a hockey game.
 */
async function sync() {
    const value = $(`input[name="sync"]:checked`).val();
    const wsAddress = $("#ws-address").val();

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
        replayElement.html($("#snapshot-sync-template").html());
        $("#sync-error").text(`Failed to sync: ${e.message}`);
        $("#ws-address").val(wsAddress);
        syncSource = undefined;
    }
}

/**
 * Update the period slider based on a timestamp from the sync source.
 */
async function updateGameTime(timestamp) {
    const gameTime = calculateGameTime(timestamp);
    const lastEventTime = getLastEventTime();
    const now = new Date();

    // Check if the game data needs to be downloaded again.
    if (lastEventTime - gameTime.totalTime < REDOWNLOAD_THRESHOLD && (now.getTime() - lastDownloadTime.getTime()) > DOWNLOAD_MIN_INTERVAL) { 
        await downloadGameData();
        const periodCount = getPeriodCount();
        if (periodCount >  lastPeriodCount) {
            setupPeriods(lastPeriodCount);
        }
    }

    $("#period-combo").val(gameTime.period);
    setSliderValue(gameTime.time);
}

/**
 * Setup the period combo box and slider.
 */
function setupGameControls() {
    replayElement.html($("#replay-template").html());
    const period = $("#period-combo");
    period.prop("disabled", !!syncSource);
    period.change(e => {
        setupPeriodSlider();
        setSliderValue(0);
    });

    setupPeriods(0, getPeriodCount());
    setupPeriodSlider();
}

/**
 * Setup the values of the period combo box.
 */
function setupPeriods(start) {
    const period = $("#period-combo");
    const periods = getPeriodCount();
    for (let i = start; i < periods; i++) {
        const opt = $("<option></option>");
        opt.attr("value", i + 1);
        opt.text(periodNames[i]);
        period.append(opt);
    }

    lastPeriodCount = periods;
}

/**
 * Setup the period slider. Display an OT slider if needed.
 */
function setupPeriodSlider() {
    const period = $("#period-combo");
    const currentPeriod = parseInt(period.val());

    if (lastPeriod === 0 || (lastPeriod > 3 && currentPeriod <= 3)) {
        $("#period-range-container").html($("#full-period-slider").html());
        registerSliderEvents();
    }

    if (!gameData.playoffs && lastPeriod <= 3 && currentPeriod > 3) {
        $("#period-range-container").html($("#ot-period-slider").html());
        registerSliderEvents();
    }

    lastPeriod = currentPeriod;
}

/**
 * Register event handlers for slider events.
 */
function registerSliderEvents() {
    const slider = $("#period-slider");
    const sliderChange = () => {
        var remaining = slider.prop("max") - slider.val();
        var minutes = Math.floor(remaining / MINUTE);
        var seconds = remaining % MINUTE;
        $("#period-label").text(`${minutes}:${formatWithLeadingZero(seconds)}`);
    };

    slider[0].oninput = sliderChange;
    slider.prop("disabled", !!syncSource);
}

/**
 * Return the number of periods in the game data.
 */
function getPeriodCount() {
    const length = gameData.gameTime.length;
    if (!length) {
        return 1;
    }

    let periods = gameData.gameTime[length - 1].p;
    if (!gameData.playoffs && periods > 4) {
        periods = 4;
    }

    return periods;
}

/**
 * Return the start time of the last event in the game data.
 */
function getLastEventTime() {
    const length = gameData.gameTime.length;
    if (!length) {
        return 0;
    }

    const event = gameData.gameTime[length - 1];

    return (event.p - 1) * PERIOD_LEN + event.s;
}

/**
 * Sets the value of the period slider.
 */
function setSliderValue(value) {
    const slider = $("#period-slider");
    slider.val(value);
    slider[0].oninput();
}

/**
 * Convert a timestamp from a sync source to a time in the hockey game.
 */
function calculateGameTime(timestamp) {
	var index = gameData.gameTime.findIndex(p => p.st > timestamp);
	if (index < 0) {
		index = gameData.gameTime.length;
	} else if (index === 0) {
		return {
			period: 1,
			time: 0,
			totalTime: 0
		};
	}

	var play = gameData.gameTime[index - 1];

	if (play.et && play.et < timestamp) {
		timestamp = play.et;
	}

	var seconds = play.s + (timestamp - play.st) / MILLISECONDS;
	seconds = Math.min(seconds, PERIOD_LEN);

	return {
		period: play.p,
		time: seconds,
		totalTime: (play.p - 1) * PERIOD_LEN + seconds
	};
}
