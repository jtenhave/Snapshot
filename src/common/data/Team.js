const Player = require("./Player");

/**
 * Class that represents a team in the game.
 */
class Team {

    constructor(rawData) {
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
    findPlayer(id) {
        return this.players.find(p => p.id === id);
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON() {
        const json = {
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
    static fromJSON(json, short) {
        const team = new Team();
        team.name = json.n;
        if (json.p && !short) {
            team.players = json.p.map(p => Player.fromJSON(p));
        }

        return team;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Team;
}
