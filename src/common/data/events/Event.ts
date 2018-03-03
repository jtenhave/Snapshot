import { BlockedShotEvent } from "./BlockedShotEvent";
import { Event } from "./_Event";
import { FaceoffEvent } from "./FaceoffEvent";
import { GiveawayEvent } from "./GiveawayEvent";
import { GoalEvent } from "./GoalEvent";
import { HitEvent } from "./HitEvent";
import { MissedShotEvent } from "./MissedShotEvent";
import { ShotEvent } from "./ShotEvent";
import { StoppageEvent } from "./StoppageEvent";
import { TakeawayEvent } from "./TakeawayEvent";

export { Event } from "./_Event";

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
