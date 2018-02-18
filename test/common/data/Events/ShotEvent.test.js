const assert = require("assert");
const samples = require ("../../../samples/gameData");
const ShotEvent = require("../../../../src/common/data/Events/ShotEvent.js");

describe("ShotEvent", () => {
    describe("constructor()", () => {
        it("Initializes ShotEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[4];

            const event = new ShotEvent(rawEvent);

            assert.strictEqual(event.isInPlayEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.shooter, "8469521");
        });
    });
});
