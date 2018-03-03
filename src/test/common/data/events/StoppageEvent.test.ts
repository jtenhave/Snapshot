import "mocha";
import * as assert from "assert";
import * as samples from "../../../samples/gameData";
import { StoppageEvent } from "../../../../common/data/events/StoppageEvent";

describe("StoppageEvent", () => {
    describe("constructor()", () => {
        it("Initializes StoppageEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[120];

            const event = new StoppageEvent(rawEvent);

            assert.strictEqual(event.isPlayStopEvent, true);
            assert.strictEqual(event.period, 1);
        });
    });
});
