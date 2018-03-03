import { Event } from "./_Event";

/**
 * Class that represents a blocked shot event in a game.
 */
export class BlockedShotEvent extends Event {
    
    /**
     * Occurs between a faceoff and a whistle. 
     */
    readonly isInPlayEvent: boolean = true;

    /**
     * Player that shot the puck.
     */
    shooter: string;

    /**
     * Player that blocked the shot.
     */
    blocker: string;

    constructor(rawData) {
        super(rawData);

        this.isInPlayEvent = true;
        this.shooter = this.findPlayer("Shooter", rawData);
        this.blocker = this.findPlayer("Blocker", rawData);
    }
}
