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
     * Number of the player.
     */
    number: number;
    
    /**
     * Position of the player
     */
    position: string;

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
     * The number of faceoff wins.
     */
    faceoffWins: number;

    /**
     * The number of faceoff losses.
     */
    faceoffLosses: number;

    /**
     * Faceoff percentage.
     */
    faceoffPercent: string;

    /**
     * The number of hits.
     */
    hits: number;

    /**
     * The number of blocks.
     */
    blocks: number;

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
     * Number of the player.
     */
    number: number;

    /**
     * Position of the player
     */
    position: string;

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
     * Blocks made by the player.
     */
    blocks: EventData;

    /**
     * The player's cumulative time on ice.
     */
    tois: PolledData;

    /**
     * The player's current time on ice.
     */
    toi: number;

    constructor (rawData?: any) { 
        this.goals = new EventData();
        this.assists = new EventData();
        this.shots = new EventData();
        this.faceoffWin = new EventData();
        this.faceoffLoss = new EventData();
        this.hits = new EventData();
        this.blocks = new EventData();
        this.tois = new PolledData();
        
        if (rawData) {
            this.id = rawData.person.id.toString();
            this.name = rawData.person.fullName;
            this.number = parseInt(rawData.jerseyNumber);
            this.position = rawData.position.code;

            if (rawData.stats.skaterStats) {
                this.toi = TimeUtils.toSeconds(rawData.stats.skaterStats.timeOnIce);
            }   
        } 
    }

    /**
     * Create a string representing a faceoff percentage.
     */
    static createFaceoffPercent(wins: number, losses: number): string {
        const totalFaceoffs = wins + losses;
        const percent = totalFaceoffs === 0 ? "-" : (wins / totalFaceoffs).toFixed(3).toString();
        return `${wins}/${totalFaceoffs} ${percent}`;
    }

    /**
     * Create a snapshot of player stats.
     */
    createSnapshot(time: number): PlayerSnapshot {
        let toi = this.tois.getValue(time);
        let minutes = Math.floor(toi / TimeUtils.MINUTE);
        let seconds = toi % TimeUtils.MINUTE;

        const faceoffWins = this.faceoffWin.getCount(time);
        const faceoffLosses = this.faceoffLoss.getCount(time);

        return {
            name: this.name,
            number: this.number,
            position: this.position,
            goals: this.goals.getCount(time),
            assists: this.assists.getCount(time),
            shots: this.shots.getCount(time),
            faceoffWins: faceoffWins,
            faceoffLosses: faceoffLosses,
            faceoffPercent: this.position !== "G" ? Player.createFaceoffPercent(faceoffWins, faceoffLosses) : "-",
            hits: this.hits.getCount(time),
            blocks: this.blocks.getCount(time),
            toi: `${DateUtils.formatWithLeadingZero(minutes)}:${DateUtils.formatWithLeadingZero(seconds)}`
        }
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON(): any {
        return {
            n: this.name,
            nu: this.number,
            p: this.position,
            g: this.goals.toJSON(),
            a: this.assists.toJSON(),
            s: this.shots.toJSON(),
            fw: this.faceoffWin.toJSON(),
            fl: this.faceoffLoss.toJSON(),
            h: this.hits.toJSON(),
            b: this.blocks.toJSON(),
            t: this.tois.toJSON()
        }
    }

    /**
     * Creates a Player from a minified JSON object.
     */
    static fromJSON(json: any): Player {
        const player = new Player();
        player.name = json.n;
        player.number = json.nu;
        player.position = json.p;
        player.goals = EventData.fromJSON(json.g || []);
        player.assists = EventData.fromJSON(json.a || []);
        player.shots = EventData.fromJSON(json.s || []);
        player.faceoffWin = EventData.fromJSON(json.fw || []);
        player.faceoffLoss = EventData.fromJSON(json.fl || []);
        player.hits = EventData.fromJSON(json.h || []);
        player.blocks = EventData.fromJSON(json.b || []);
        player.tois = PolledData.fromJSON(json.t || { t: [], v: []});

        return player;
    }
}
