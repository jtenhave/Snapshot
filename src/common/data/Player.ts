import { EventData } from "./EventData";
import { PolledData } from "./PolledData";
import { DateUtils } from "../DateUtils";
import { TimeUtils } from "../TimeUtils";

/**
 * A snapshot of player stats.
 */
export interface PlayerSnapshot {

    /**
     * The name of the player.
     */
    name: string;

    /**
     * The number of goals.
     */
    goals: number;

    /**
     * The number of assists.
     */
    assists: number;

    /**
     * The number of shots.
     */
    shots: number;

    /**
     * The number of hits.
     */
    hits: number;

    /**
     * The total time on ice.
     */
    toi: string;
}

/**
 * Class that represents a player in the game.
 */
export class Player {

    /**
     * Player ID.
     */
    id: string;

    /**
     * Name of the player.
     */
    name: string;

    /**
     * Goals scored by the player.
     */
    goals: EventData;

    /**
     * Assists made by the player.
     */
    assists: EventData;

    /**
     * Shots made by the player;
     */
    shots: EventData;

    /**
     * Faceoff wins by the player.
     */
    faceoffWin: EventData;

    /**
     * Faceoff losses by the player.
     */
    faceoffLoss: EventData;

    /**
     * Hits made by the player.
     */
    hits: EventData;

    /**
     * The player's cumulative time on ice.
     */
    tois: PolledData;

    /**
     * The player's current time on ice.
     */
    toi: number;

    constructor (rawData?: any) { 
        this.goals = new EventData(),
        this.assists = new EventData(),
        this.shots = new EventData(),
        this.faceoffWin = new EventData(),
        this.faceoffLoss = new EventData(),
        this.hits = new EventData(),
        this.tois = new PolledData();
        
        if (rawData) {
            this.id = rawData.person.id.toString();
            this.name = rawData.person.fullName;

            if (rawData.stats.skaterStats) {
                this.toi = TimeUtils.toSeconds(rawData.stats.skaterStats.timeOnIce);
            }   
        } 
    }

    /**
     * Create a snapshot of player stats.
     */
    createSnapshot(time: number): PlayerSnapshot {
        let toi = this.tois.getValue(time);
        let minutes = Math.floor(toi / TimeUtils.MINUTE);
        let seconds = toi % TimeUtils.MINUTE;
        
        return {
            name: this.name,
            goals: this.goals.getCount(time),
            assists: this.assists.getCount(time),
            shots: this.shots.getCount(time),
            hits: this.hits.getCount(time),
            toi: `${DateUtils.formatWithLeadingZero(minutes)}:${DateUtils.formatWithLeadingZero(seconds)}`
        }
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON(): any {
        return {
            n: this.name,
            g: this.goals.toJSON(),
            a: this.assists.toJSON(),
            s: this.shots.toJSON(),
            fw: this.faceoffWin.toJSON(),
            fl: this.faceoffLoss.toJSON(),
            h: this.hits.toJSON(),
            t: this.tois.toJSON()
        }
    }

    /**
     * Creates a Player from a minified JSON object.
     */
    static fromJSON(json: any): Player {
        const player = new Player();
        player.name = json.n;
        player.goals = EventData.fromJSON(json.g || []);
        player.assists = EventData.fromJSON(json.a || []);
        player.shots = EventData.fromJSON(json.s || []);
        player.faceoffWin = EventData.fromJSON(json.fw || []);
        player.faceoffLoss = EventData.fromJSON(json.fl || []);
        player.hits = EventData.fromJSON(json.h || []);
        player.tois = PolledData.fromJSON(json.t || { t: [], v: []});

        return player;
    }
}
