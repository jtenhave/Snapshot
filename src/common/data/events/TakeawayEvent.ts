import { Event } from "./_Event";

/**
 * Class that represents a takeaway event in a game.
 */
export class TakeawayEvent extends Event {
    
    /**
     * Occurs between a faceoff and a whistle. 
     */
    readonly isInPlayEvent: boolean = true;

    constructor(rawData) {
        super(rawData);

        this.isInPlayEvent = true;
    }
}
