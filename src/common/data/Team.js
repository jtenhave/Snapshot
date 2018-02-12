const Player = require("./Player");

/**
 * Class that represents a team in the game.
 */
class Team {

    constructor(rawData) {
        if (rawData) {
            this.id = rawData.team.triCode;
            this.name = rawData.team.name;
            this.players = [];

            for (const playerId of Object.keys(rawData.players)) {
                const rawPlayerData = rawData.players[playerId];
                if (rawData.scratches.indexOf(rawPlayerData.person.id) < 0) {
                    this.players.push(new Player(rawPlayerData));
                }
            }
        }
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON() {
        return {
            n: this.name,
            p: this.players.map(p => p.toJSON())
        }
    }

    /**
     * Creates a Team from a minified JSON object.
     */
    static fromJSON(json) {
        const team = new Team();
        team.name = json.n;
        team.players = json.p.map(p => Player.fromJSON(p));

        return team;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Team;
}
