import "mocha";
import * as assert from "assert";
import * as samples from "../../../samples/gameData";
import { BlockedShotEvent } from "../../../../common/data/events/BlockedShotEvent";

describe("BlockedShotEvent", () => {
    describe("constructor()", () => {
        it("Initializes BlockedShotEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[24];
            
            const event = new BlockedShotEvent(rawEvent);

            assert.strictEqual(event.isInPlayEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.blocker, "8476470");
            assert.strictEqual(event.shooter, "8475848");
        });
    });
});