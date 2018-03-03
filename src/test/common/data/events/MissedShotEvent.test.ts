import "mocha";
import * as assert from "assert";
import * as samples from "../../../samples/gameData";
import { MissedShotEvent } from "../../../../common/data/events/MissedShotEvent";

describe("MissedShotEvent", () => {
    describe("constructor()", () => {
        it("Initializes MissedShotEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[29];
            
            const event = new MissedShotEvent(rawEvent);

            assert.strictEqual(event.isInPlayEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.shooter, "8476948");
        });
    });
});