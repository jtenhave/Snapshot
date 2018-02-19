const assert = require("assert");
const samples = require ("../../samples/scheduleData");
const GameInfo = require("../../../src/common/data/GameInfo");

describe("GameInfo", () => {
    describe("constructor()", () => {
        it("Initializes GameInfo", () => {
            const gameInfo = new GameInfo(samples.multiGames.dates[0].games[0]);

            assert.strictEqual(gameInfo.id, "2017020614");
            assert.strictEqual(gameInfo.date.getTime(), 1515025800000);
            assert.strictEqual(gameInfo.playoffs, false);
            assert.strictEqual(gameInfo.home, "Detroit Red Wings");
            assert.strictEqual(gameInfo.away, "Ottawa Senators");
            assert.strictEqual(gameInfo.started, false);
        });
    });

    describe("toJSON()", () => {
        it("Returns correct JSON", () => {
            const gameInfo = new GameInfo(samples.multiGames.dates[0].games[0]);

            const json = gameInfo.toJSON();

            assert.strictEqual(json._id, "2017020614");
            assert.strictEqual(json.p, false);
            assert.strictEqual(json.h, "Detroit Red Wings");
            assert.strictEqual(json.a, "Ottawa Senators");
            assert.strictEqual(json.s, false);
        });
    });

    describe("fromJSON()", () => {
        it("Returns correct GameInfo", () => {
            const json = {
                _id: "2017020614",
                p: false,
                h: "Detroit Red Wings",
                a: "Ottawa Senators",
                s: false
            };

            const gameInfo = GameInfo.fromJSON(json);

            assert.strictEqual(gameInfo.id, "2017020614");
            assert.strictEqual(gameInfo.playoffs, false);
            assert.strictEqual(gameInfo.home, "Detroit Red Wings");
            assert.strictEqual(gameInfo.away, "Ottawa Senators");
            assert.strictEqual(gameInfo.started, false);
        });
    });
});
