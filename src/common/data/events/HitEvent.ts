import { Event } from "./_Event";

/**
 * Class that represents a hit event in a game.
 */
export class HitEvent extends Event {
    
    /**
     * Occurs between a faceoff and a whistle. 
     */
    readonly isInPlayEvent: boolean = true;

    /**
     * Player that made the hit.
     */
    hitter: string;

    /**
     * Player that was hit.
     */
    hittee: string;


    constructor(rawData) {
        super(rawData);

        this.isInPlayEvent = true;
        this.hitter = this.findPlayer("Hitter", rawData);
        this.hittee = this.findPlayer("Hittee", rawData);
    }
}
