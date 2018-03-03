import { Player } from "./Player";

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
            this.id = rawData.team.triCode;
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
     * Returns a minified JSON object.
     */
    toJSON(): any {
        const json: any = {
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
        team.name = json.n;
        if (json.p && !short) {
            team.players = json.p.map(p => Player.fromJSON(p));
        }

        return team;
    }
}
