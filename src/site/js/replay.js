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
    } catch(e) {
        replayElement.html($("#snapshot-sync-template").html());
        $("#sync-error").text(`Failed to sync: ${e.message}`);
        $("#ws-address").val(wsAddress);
        syncSource = undefined;
    }
}