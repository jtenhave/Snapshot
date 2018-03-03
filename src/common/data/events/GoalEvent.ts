import { Event } from "./_Event";

/**
 * Class that represents a goal event in a game.
 */
export class GoalEvent extends Event {
    
    /**
     * Occurs at the end of a play.
     */
    readonly isPlayStopEvent: boolean = true;

    /**
     * Player that stored the score.
     */
    scorer: string;

    /**
     * Players that assisted on the goal.
     */
    assistants: string[] =[];

    constructor(rawData) {
        super(rawData);

        this.isPlayStopEvent = true;
        this.scorer = this.findPlayer("Scorer", rawData);
        this.assistants = this.findPlayers("Assist", rawData);
    }
}
