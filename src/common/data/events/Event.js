const BlockedShotEvent = require("./BlockedShotEvent");
const Event = require("./_Event");
const FaceoffEvent = require("./FaceoffEvent");
const GiveawayEvent = require("./GiveawayEvent");
const GoalEvent = require("./GoalEvent");
const HitEvent = require("./HitEvent");
const MissedShotEvent = require("./MissedShotEvent");
const ShotEvent = require("./ShotEvent");
const StoppageEvent = require("./StoppageEvent");
const TakeawayEvent = require("./TakeawayEvent");

/**
 * Create an Event from an NHL API event.
 */
Event.create = function (rawData) {
    switch(rawData.result.event) {
        case "Stoppage":
        case "Period End":
            return new StoppageEvent(rawData);
        case "Goal":
            return new GoalEvent(rawData);
        case "Faceoff":
            return new FaceoffEvent(rawData);
        case "Shot":
            return new ShotEvent(rawData);
        case "Missed Shot":
            return new MissedShotEvent(rawData);
        case "Giveaway":
            return new GiveawayEvent(rawData);
        case "Blocked Shot":
            return new BlockedShotEvent(rawData);
        case "Takeaway":
            return new TakeawayEvent(rawData);
        case "Hit":
            return new HitEvent(rawData);
        default:
            return undefined;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Event;
}
