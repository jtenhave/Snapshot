const PVR_ADJUST = 22000;
const PERIOD_LEN = 1200;
const MILLISECONDS = 1000;
const periodNames = ["1st", "2nd", "3rd", "OT", "OT2", "OT3", "OT4", "OT5"];

let gameData;
let replayElement;
let syncSource;

/**
 * Initialization to do when the page is loaded.
 */
async function init() {

    // Display the loading icon 
	replayElement = $("#replay-content");
    replayElement.html($("#content-loading-template").html());
    
    var searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("game");

    gameData = await downloadGame(id);
    const date = new Date(gameData.date);
    gameData.time = `${formatLongDate(date)} ${formatTime(date)}`;

    $("#replay-matchup").html(Mustache.render($("#matchup-template").html(), gameData));
    replayElement.html($("#snapshot-sync-template").html());
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

function setupGameControls() {
    replayElement.html($("#replay-template").html());
    const period = $("#period-combo");
    period.attr("last-value", 0);
    period.prop("disabled", !!syncSource);
    
    const periods = getPeriodCount();
    for (let i = 0; i < periods; i++) {
        const opt = $("<option></option>");
        opt.attr("value", i + 1);
        opt.text(periodNames[i]);
        period.append(opt);
    }

    period.change(e => {
        setupPeriodSlider();
    });

    setupPeriodSlider();
}

function setupPeriodSlider() {
    const period = $("#period-combo");
    const currentPeriod = parseInt(period.val());
    const lastPeriod = parseInt(period.attr("last-value"));
    period.attr("last-value", currentPeriod);

    if (lastPeriod === 0 || (lastPeriod > 3 && currentPeriod <= 3)) {
        $("#period-range-container").html($("#full-period-slider").html());
    }

    if (!gameData.playoffs && lastPeriod <= 3 && currentPeriod > 3) {
        $("#period-range-container").html($("#ot-period-slider").html());
    }
}

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
