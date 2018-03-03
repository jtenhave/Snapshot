import "mocha";
import * as assert from "assert";
import * as samples from "../../../samples/gameData";
import { BlockedShotEvent } from "../../../../common/data/events/BlockedShotEvent";
import { Event } from "../../../../common/data/events/Event";
import { FaceoffEvent } from "../../../../common/data/events/FaceoffEvent";
import { GiveawayEvent } from "../../../../common/data/events/GiveawayEvent";
import { GoalEvent } from "../../../../common/data/events/GoalEvent";
import { HitEvent } from "../../../../common/data/events/HitEvent";
import { MissedShotEvent } from "../../../../common/data/events/MissedShotEvent";
import { ShotEvent } from "../../../../common/data/events/ShotEvent";
import { StoppageEvent } from "../../../../common/data/events/StoppageEvent";
import { TakeawayEvent } from "../../../../common/data/events/TakeawayEvent";

describe("Event", () => {
    describe("constructor()", () => {
        it("Initializes Event", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[200];

            const event = new Event(rawEvent);

            assert.strictEqual(event.period, 2);
            assert.strictEqual(event.periodTime, 813);
            assert.strictEqual(event.totalTime, 2013);
            assert.strictEqual(event.timestamp, new Date(rawEvent.about.dateTime).getTime());
            assert.strictEqual(event.team, "MTL");
        });
    });

    describe("findPlayer()", () => {
        it("Returns correct player id", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[60];
            const event = new Event(rawEvent);

            const player = event.findPlayer("Scorer", rawEvent);

            assert.strictEqual(player, "8469506");
        });
    });

    describe("findPlayers()", () => {
        it("Returns correct player id", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[60];
            const event = new Event(rawEvent);

            const players = event.findPlayers("Assist", rawEvent);

            assert.deepEqual(players, ["8476495"]);
        });
    });

    describe("create()", () => {
        it("Creates stoppage event from period end", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[120];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof StoppageEvent, true);
        });

        it("Creates stoppage event from whistle", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[7];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof StoppageEvent, true);
        });

        it("Creates goal event from goal", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[60];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof GoalEvent, true);
        });

        it("Creates faceoff event from faceoff", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[3];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof FaceoffEvent, true);
        });

        it("Creates shot event from shot", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[4];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof ShotEvent, true);
        });

        it("Creates missed shot event from missed shot", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[29];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof MissedShotEvent, true);
        });
        
        it("Creates blocked shot event from blocked shot", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[24];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof BlockedShotEvent, true);
        });

        it("Creates hit event from hit", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[13];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof HitEvent, true);
        });

        it("Creates giveaway event from giveaway", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[5];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof GiveawayEvent, true);
        });

        it("Creates takeaway event from takeaway", () => {
            const rawEvent = samples.finishedGameData.liveData.plays.allPlays[107];

            const event = Event.create(rawEvent);

            assert.strictEqual(event instanceof TakeawayEvent, true);
        });
    });
});
