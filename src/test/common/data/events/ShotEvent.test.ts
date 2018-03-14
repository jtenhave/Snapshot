import "mocha";
import * as assert from "assert";
import * as samples from "../../../samples/gameData";
import { ShotEvent } from "../../../../common/data/events/ShotEvent";

describe("ShotEvent", () => {
    describe("constructor()", () => {
        it("Initializes ShotEvent", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[4];

            const event = new ShotEvent(rawEvent);

            assert.strictEqual(event.isInPlayEvent, true);
            assert.strictEqual(event.period, 1);
            assert.strictEqual(event.shooter, "8469521");
            assert.strictEqual(event.goalie, "8475215");
        });
    });
});
