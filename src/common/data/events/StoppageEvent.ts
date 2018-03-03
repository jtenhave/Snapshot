import { Event } from "./_Event";

/**
 * Class that represents a stoppage event in a game.
 */
export class StoppageEvent extends Event {
    
    /**
     * Occurs at the end of a play.
     */
    readonly isPlayStopEvent: boolean = true;

    constructor(rawData) {
        super(rawData);

        this.isPlayStopEvent = true;
    }
}
