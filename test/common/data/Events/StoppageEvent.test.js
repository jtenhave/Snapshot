const assert = require("assert");
const samples = require ("../../../samples/gameData");
const StoppageEvent = require("../../../../src/common/data/Events/StoppageEvent.js");

describe("StoppageEvent", () => {
    describe("constructor()", () => {
        it("Initializes StoppageEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[120];

            const event = new StoppageEvent(rawEvent);

            assert.strictEqual(event.isPlayStopEvent, true);
            assert.strictEqual(event.period, 1);
        });
    });
});
