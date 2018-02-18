const assert = require("assert");
const samples = require ("../../../samples/gameData");
const MissedShotEvent = require("../../../../src/common/data/Events/MissedShotEvent.js");

describe("MissedShotEvent", () => {
    describe("constructor()", () => {
        it("Initializes MissedShotEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[29];
            
            const event = new MissedShotEvent(rawEvent);

            assert.strictEqual(event.isInPlayEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.shooter, "8476948");
        });
    });
});