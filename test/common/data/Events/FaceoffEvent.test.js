const assert = require("assert");
const samples = require ("../../../samples/gameData");
const FaceoffEvent = require("../../../../src/common/data/Events/FaceoffEvent.js");

describe("FaceoffEvent", () => {
    describe("constructor()", () => {
        it("Initializes FaceoffEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[3];

            const event = new FaceoffEvent(rawEvent);

            assert.strictEqual(event.isPlayStartEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.winner, "8469521");
            assert.strictEqual(event.loser, "8478403");
        });
    });
});
