import { Player, PlayerSnapshot } from "./Player";

const triCodes = {
    "1": "NJD",
    "2" : "NYI",
    "3": "NYR",
    "4": "PHI",
    "5": "PIT",
    "6": "BOS",
    "7": "BUF",
    "8": "MTL",
    "9": "OTT",
    "10": "TOR",
    "12": "CAR",
    "13": "FLA",
    "14": "TBL",
    "15": "WSH",
    "16": "CHI",
    "17": "DET",
    "18": "NSH",
    "19": "STL",
    "20": "CGY",
    "21": "COL",
    "22": "EDM",
    "23": "VAN",
    "24": "ANA",
    "25": "DAL",
    "26": "LAK",
    "28": "SJS",
    "29": "CBJ",
    "30": "MIN",
    "52": "WPG",
    "53": "ARI",
    "54": "VGK"
}

/**
 * A snapshot of team stats.
 */
export interface TeamSnapshot {

    /**
     * The number of goals
     */
    goals: number;

    /**
     * The number of shots.
     */
    shots: number;

    /**
     * The number of hits.
     */
    hits: number;

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
     * Player snapshots.
     */
    players: PlayerSnapshot[];
}

/**
 * Class that represents a team in the game.
 */
export class Team {

    /**
     * Team ID.
     */
    id: string;
    
    /**
     * Name of the team.
     */
    name: string;

    /**
     * Players on the team.
     */
    players: Player[];

    /**
     * The team playing against this team.
     */
    opposition?: Team;

    constructor(rawData?: any) {
        if (rawData) {
            this.id = rawData.team.triCode || triCodes[rawData.team.id.toString()];
            this.name = rawData.team.name;

            if (rawData.players) {
                this.players = [];
                for (const playerId of Object.keys(rawData.players)) {
                    const rawPlayerData = rawData.players[playerId];
                    if (rawData.scratches.indexOf(rawPlayerData.person.id) < 0) {
                        this.players.push(new Player(rawPlayerData));
                    }
                }
            }  
        }
    }

    /**
     * Finds a player on a team given their ID.
     */
    findPlayer(id: string): Player {
        if (this.players) {
            return this.players.find(p => p.id === id);
        }
    }

    /**
     * Creates a snapshot of team stats.
     */
    createSnapshot(time: number): TeamSnapshot {
        var players = this.players.map(p => p.createSnapshot(time));

        const faceoffWins = players.reduce((a, c) => a + c.faceoffWins, 0);
        const faceoffLosses = players.reduce((a, c) => a + c.faceoffLosses, 0);

        return {
            goals: players.reduce((a, c) => a + c.goals, 0),
            shots: players.reduce((a, c) => c.position === "G" ? a : a + c.shots, 0),
            hits: players.reduce((a, c) => a + c.hits, 0),
            faceoffWins: faceoffWins,
            faceoffLosses: faceoffLosses,
            faceoffPercent: Player.createFaceoffPercent(faceoffWins, faceoffLosses),
            players: players
        }
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON(): any {
        const json: any = {
            id: this.id,
            n: this.name
        };

        if (this.players) {
            json.p = this.players.map(p => p.toJSON())
        }

        return json;
    }

    /**
     * Creates a Team from a minified JSON object.
     */
    static fromJSON(json: any, short?: boolean): Team {
        const team = new Team();
        team.id = json.id;
        team.name = json.n;
        if (json.p && !short) {
            team.players = json.p.map(p => Player.fromJSON(p));
        }

        return team;
    }
}
