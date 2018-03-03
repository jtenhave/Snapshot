import { TimeUtils } from "../../TimeUtils";

/**
 * Class that represents an event in a game.
 */
export class Event {

    /**
     * Occurs at the beginning of a play.
     */
    isPlayStartEvent: boolean = false;

    /**
     * Occurs at the end of a play.
     */
    isPlayStopEvent: boolean = false;

    /**
     * Occurs between a faceoff and a whistle. 
     */
    isInPlayEvent: boolean = false;

    /**
     * Period the event occurred in.
     */
    period: number;

    /**
     * Time elapsed in the period.
     */
    periodTime: number;

    /**
     * Team the event belongs to.
     */
    team: string;

    /**
     * Timestamp for the event.
     */
    timestamp: number;

    /**
     * Time elapsed in the game.
     */
    totalTime: number;

    constructor(rawData: any) {
        this.periodTime = TimeUtils.toPeriodTime(rawData.about.periodTime);
        this.period = rawData.about.period;
        this.totalTime = TimeUtils.toTotalTime(rawData.about.periodTime, this.period - 1);
        this.timestamp = new Date(rawData.about.dateTime).getTime();

        if (rawData.team) {
            this.team = rawData.team.triCode;
        }
    }

    /**
     * Finds a player in a event given a player type.
     */
    findPlayer(type: string, rawData: any): string {
        const player = rawData.players.find(p => p.playerType === type);
        if (!player) {
            return undefined;
        }

        return player.player.id.toString();
    }

    /**
     * Finds players in a event given a player type.
     */
    findPlayers(type: string, rawData: any): string[] {
        return rawData.players.filter(p => p.playerType === type).map(p => p.player.id.toString());
    }

    /**
     * Implemented in _Event to avoid circular reference.
     */
    static create(rawData: any): Event {
        throw new Error("Implemented in _Event");
    }
}
