import "mocha";
import * as assert from "assert";
import * as samples from "../../samples/gameData";
import { Player } from "../../../common/data/Player";

describe("Player", () => {
    describe("constructor()", () => {
        it("Initializes Player", () => {
            const playerData = samples.finishedGameData.liveData.boxscore.teams.away.players.ID8468309;

            const player = new Player(playerData);

            assert.strictEqual(player.id, "8468309");
            assert.strictEqual(player.name, "Mark Streit");
            assert.strictEqual(player.position, "D");
            assert.strictEqual(player.number, 32);
            assert.strictEqual(player.toi, 759);
            assert.notStrictEqual(player.goals, undefined);
            assert.notStrictEqual(player.assists, undefined);
            assert.notStrictEqual(player.shots, undefined);
            assert.notStrictEqual(player.faceoffWin, undefined);
            assert.notStrictEqual(player.faceoffLoss, undefined);
            assert.notStrictEqual(player.hits, undefined);
            assert.notStrictEqual(player.blocks, undefined);
            assert.notStrictEqual(player.tois, undefined);
        }); 
    });

    describe("createSnapshot()", () => {
        it("Returns correct snapshot", () => {
            const playerData = samples.finishedGameData.liveData.boxscore.teams.away.players.ID8468309;
            const player = new Player(playerData);
            player.goals.addTime(1);
            player.goals.addTime(3);
            player.assists.addTime(1);
            player.assists.addTime(3);
            player.shots.addTime(1);
            player.shots.addTime(3);
            player.faceoffWin.addTime(1);
            player.faceoffWin.addTime(2);
            player.faceoffWin.addTime(3);
            player.faceoffLoss.addTime(1);
            player.faceoffLoss.addTime(4);
            player.hits.addTime(1);
            player.hits.addTime(3);
            player.blocks.addTime(1);
            player.blocks.addTime(3);
            player.tois.addValue(1, 308);
            player.tois.addValue(3, 456);

            const snapshot = player.createSnapshot(2);

            assert.strictEqual(snapshot.name, player.name);
            assert.strictEqual(snapshot.number, player.number);
            assert.strictEqual(snapshot.position, player.position);
            assert.strictEqual(snapshot.goals, 1);
            assert.strictEqual(snapshot.assists, 1);
            assert.strictEqual(snapshot.shots, 1);
            assert.strictEqual(snapshot.faceoffWins, 2);
            assert.strictEqual(snapshot.faceoffLosses, 1);
            assert.strictEqual(snapshot.faceoffPercent, "2/3 0.667");
            assert.strictEqual(snapshot.hits, 1);
            assert.strictEqual(snapshot.blocks, 1);
            assert.strictEqual(snapshot.toi, "05:08");
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
            player.blocks.addTime(1);
            player.tois.addValue(1, 2);

            const json = player.toJSON();

            assert.strictEqual(json.n, player.name);
            assert.deepEqual(json.g, [1]);
            assert.deepEqual(json.a, [1]);
            assert.deepEqual(json.s, [1]);
            assert.deepEqual(json.fw, [1]);
            assert.deepEqual(json.fl, [1]);
            assert.deepEqual(json.h, [1]);
            assert.deepEqual(json.b, [1]);
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
                b: [1],
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
            assert.deepEqual(player.blocks.times, [1]);
            assert.deepEqual(player.tois.times, [1]);
            assert.deepEqual(player.tois.values, [2]);
        });
    });
});
