const assert = require("assert");
const samples = require ("../../samples/gameData");
const Play = require("../../../src/server/data/Play.js");

describe("Play", () => {
    describe("start()", () => {
        it("Sets play start properties", () => {
            const event = samples.finishedGameData.liveData.plays.allPlays[8];

            const play = Play.start(event);

            assert.strictEqual(play.period, 1);
            assert.strictEqual(play.start, 25);
            assert.strictEqual(play.startTimestamp, 1507245159000);
        });
    });

    describe("stop()", () => {
        it("Sets play end properties", () => {
            const startEvent = samples.finishedGameData.liveData.plays.allPlays[8];
            const stopEvent = samples.finishedGameData.liveData.plays.allPlays[10];
            const play = Play.start(startEvent);

            play.stop(stopEvent, true);

            assert.strictEqual(play.end, 56);
            assert.strictEqual(play.endTimestamp, 1507245206000);
            assert.strictEqual(play.hasStoppage, true);
        });

        it("Adjusts play start timestamp", () => {
            const startEvent = samples.finishedGameData.liveData.plays.allPlays[8];
            const stopEvent = samples.finishedGameData.liveData.plays.allPlays[10];
            const play = Play.start(startEvent);

            play.stop(stopEvent, true);

            assert.strictEqual(play.startTimestamp, 1507245175000);
        });
    });

    describe("toJSON()", () => {
        it("Converts play to JSON", () => {
            const startEvent = samples.finishedGameData.liveData.plays.allPlays[8];
            const stopEvent = samples.finishedGameData.liveData.plays.allPlays[10];
            const play = Play.start(startEvent);
            play.stop(stopEvent, true);

            const json = play.toJSON();

            assert.strictEqual(json.s, 25);
            assert.strictEqual(json.st, 1507245175000);
            assert.strictEqual(json.e, 56);
            assert.strictEqual(json.et, 1507245206000);
            assert.strictEqual(json.p, 1);
            assert.strictEqual(json.hs, true);
        });
    });
});
