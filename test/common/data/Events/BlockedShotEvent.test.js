const assert = require("assert");
const samples = require ("../../../samples/gameData");
const BlockedShotEvent = require("../../../../src/common/data/Events/BlockedShotEvent.js");

describe("BlockedShotEvent", () => {
    describe("constructor()", () => {
        it("Initializes BlockedShotEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[24];
            
            const event = new BlockedShotEvent(rawEvent);

            assert.strictEqual(event.isInPlayEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.blocker, "8476470");
            assert.strictEqual(event.shooter, "8475848");
        });
    });
});