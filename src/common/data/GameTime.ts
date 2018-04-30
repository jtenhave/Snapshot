import { TimeUtils } from "../TimeUtils";

/**
 * Represents a point in the game.
 */
export class GameTime {
    
    /**
     * Current period in the game.
     */
    period: number;

    /**
     * Time elapsed in the current period.
     */
    time: number;

    /**
     * Time elapsed in the game.
     */
    get totalTime(): number {
        return (this.period - 1) * TimeUtils.PERIOD_LEN + this.time
    }

    constructor(period, time) {
        this.period = period;
        this.time = time;
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON(): any {
        return {
            p: this.period,
            t: this.time
        };
    }

    /**
     * Creates an GameTime from a minified JSON object.
     */
    static fromJSON(json: any): GameTime {
        return new GameTime(json.p, json.t);
    }
}