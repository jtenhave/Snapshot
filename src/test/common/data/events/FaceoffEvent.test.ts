import "mocha";
import * as assert from "assert";
import * as samples from "../../../samples/gameData";
import { FaceoffEvent } from "../../../../common/data/events/FaceoffEvent";

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
