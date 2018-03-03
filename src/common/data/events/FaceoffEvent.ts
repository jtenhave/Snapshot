import { Event } from "./_Event";

/**
 * Class that represents a faceoff event in a game.
 */
export class FaceoffEvent extends Event {
    
    /**
     * Occurs at the beginning of a play.
     */
    readonly isPlayStartEvent: boolean = true;

    /**
     * Player that won the faceoff.
     */
    winner: string;

    /**
     * Player that lost the faceoff.
     */
    loser: string;

    constructor(rawData) {
        super(rawData);

        this.isPlayStartEvent = true;
        this.winner = this.findPlayer("Winner", rawData);
        this.loser = this.findPlayer("Loser", rawData);
    }
}
