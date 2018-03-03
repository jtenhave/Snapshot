import { Event } from "./_Event";

/**
 * Class that represents a missed shot event in a game.
 */
export class MissedShotEvent extends Event {
    
    /**
     * Occurs between a faceoff and a whistle. 
     */
    readonly isInPlayEvent: boolean = true;

    /**
     * Player that shot the puck.
     */
    shooter: string;

    constructor(rawData) {
        super(rawData);

        this.isInPlayEvent = true;
        this.shooter = this.findPlayer("Shooter", rawData);
    }
}
