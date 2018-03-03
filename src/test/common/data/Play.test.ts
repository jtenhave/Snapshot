import "mocha";
import * as assert from "assert";
import * as samples from "../../samples/gameData";
import { Event } from "../../../common/data/events/Event";
import { Play } from "../../../common/data/Play";

describe("Play", () => {
    describe("start()", () => {
        it("Sets play start properties", () => {
            const event = new Event(samples.finishedGameData.liveData.plays.allPlays[8]);

            const play = Play.start(event);

            assert.strictEqual(play.period, 1);
            assert.strictEqual(play.start, 25);
            assert.strictEqual(play.startTimestamp, 1507245159000);
        });
    });

    describe("stop()", () => {
        it("Sets play end properties", () => {
            const startEvent = new Event(samples.finishedGameData.liveData.plays.allPlays[8]);
            const stopEvent = new Event(samples.finishedGameData.liveData.plays.allPlays[10]);

            const play = Play.start(startEvent);

            play.stop(stopEvent);

            assert.strictEqual(play.end, 56);
            assert.strictEqual(play.endTimestamp, 1507245206000);
            assert.strictEqual(play.finished, true);
        });

        it("Adjusts play start timestamp", () => {
            const startEvent = new Event(samples.finishedGameData.liveData.plays.allPlays[8]);
            const stopEvent = new Event(samples.finishedGameData.liveData.plays.allPlays[10]);
            const play = Play.start(startEvent);

            play.stop(stopEvent);

            assert.strictEqual(play.startTimestamp, 1507245175000);
        });
    });

    describe("toJSON()", () => {
        it("Returns correct JSON", () => {
            const play = new Play();
            play.start = 25;
            play.startTimestamp = 1507245175000;
            play.end = 56;
            play.endTimestamp = 1507245206000;
            play.period = 1;

            const json = play.toJSON();

            assert.strictEqual(json.s, 25);
            assert.strictEqual(json.st, 1507245175000);
            assert.strictEqual(json.e, 56);
            assert.strictEqual(json.et, 1507245206000);
            assert.strictEqual(json.p, 1);
        });
    });

    describe("fromJSON()", () => {
        it("Returns correct Play", () => {
            const json = {
                s: 25,
                st: 1507245175000,
                e: 56,
                et: 1507245206000,
                p: 1
            };

            const play = Play.fromJSON(json);

            assert.strictEqual(play.start, 25);
            assert.strictEqual(play.startTimestamp, 1507245175000);
            assert.strictEqual(play.end, 56);
            assert.strictEqual(play.endTimestamp, 1507245206000);
            assert.strictEqual(play.period, 1);
        });
    });
});
