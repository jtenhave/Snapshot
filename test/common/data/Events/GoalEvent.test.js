const assert = require("assert");
const samples = require ("../../../samples/gameData");
const GoalEvent = require("../../../../src/common/data/Events/GoalEvent.js");

describe("GoalEvent", () => {
    describe("constructor()", () => {
        it("Initializes GoalEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[60];

            const event = new GoalEvent(rawEvent);

            assert.strictEqual(event.isPlayStopEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.scorer, "8469506");
            assert.deepEqual(event.assistants, ["8476495"]);
        });
    });
});
