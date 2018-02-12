const assert = require("assert");
const samples = require ("../../samples/gameData");
const Player = require("../../../src/common/data/Player.js");

describe("Player", () => {
    describe("constructor()", () => {
        it("Initializes Player", () => {
            const playerData = samples.finishedGameData.liveData.boxscore.teams.away.players.ID8468309;

            const player = new Player(playerData);

            assert.strictEqual(player.id, "8468309");
            assert.strictEqual(player.name, "Mark Streit");
            assert.strictEqual(player.toi, 759);
            assert.strictEqual(player.goals !== undefined, true);
            assert.strictEqual(player.assists !== undefined, true);
            assert.strictEqual(player.shots !== undefined, true);
            assert.strictEqual(player.faceoffWin !== undefined, true);
            assert.strictEqual(player.faceoffLoss !== undefined, true);
            assert.strictEqual(player.hits !== undefined, true);
            assert.strictEqual(player.tois !== undefined, true);
        }); 
    });

    describe("toJSON()", () => {
        it("Returns correct JSON", () => {
            const playerData = samples.finishedGameData.liveData.boxscore.teams.away.players.ID8468309;
            const player = new Player(playerData);
            player.goals.addTime(1);
            player.assists.addTime(1);
            player.shots.addTime(1);
            player.faceoffWin.addTime(1);
            player.faceoffLoss.addTime(1);
            player.hits.addTime(1);
            player.tois.addValue(1, 2);

            const json = player.toJSON();

            assert.strictEqual(json.n, player.name);
            assert.deepEqual(json.g, [1]);
            assert.deepEqual(json.a, [1]);
            assert.deepEqual(json.s, [1]);
            assert.deepEqual(json.fw, [1]);
            assert.deepEqual(json.fl, [1]);
            assert.deepEqual(json.h, [1]);
            assert.deepEqual(json.t, { t: [1], v: [2]});
        });
    });

    describe("fromJSON()", () => {
        it("Returns correct Player", () => {
            const json = {
                n: "player",
                g: [1],
                a: [1],
                s: [1],
                fw: [1],
                fl: [1],
                h: [1],
                t: { t: [1], v: [2] }
            };

            const player = Player.fromJSON(json);

            assert.strictEqual(player.name, json.n);
            assert.deepEqual(player.goals.times, [1]);
            assert.deepEqual(player.assists.times, [1]);
            assert.deepEqual(player.shots.times, [1]);
            assert.deepEqual(player.faceoffWin.times, [1]);
            assert.deepEqual(player.faceoffLoss.times, [1]);
            assert.deepEqual(player.hits.times, [1]);
            assert.deepEqual(player.tois.times, [1]);
            assert.deepEqual(player.tois.values, [2]);
        });
    });
});
