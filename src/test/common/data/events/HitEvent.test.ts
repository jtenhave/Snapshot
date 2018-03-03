import "mocha";
import * as assert from "assert";
import * as samples from "../../../samples/gameData";
import { HitEvent } from "../../../../common/data/events/HitEvent";

describe("HitEvent", () => {
    describe("constructor()", () => {
        it("Initializes HitEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[13];
            
            const event = new HitEvent(rawEvent);

            assert.strictEqual(event.isInPlayEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.hitter, "8470642");
            assert.strictEqual(event.hittee, "8476878");
        });
    });
});
