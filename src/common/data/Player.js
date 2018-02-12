const PolledData = require("./PolledData");
const EventData = require("./EventData");
const timeUtils = require("../timeUtils");

/**
 * Class that represents a player in the game.
 */
class Player {

    constructor (rawData) {
        if (rawData) {
            this.id = rawData.person.id.toString();
            this.name = rawData.person.fullName;

            if (rawData.stats.skaterStats) {
                this.toi = timeUtils.toPeriodTime(rawData.stats.skaterStats.timeOnIce);
            }   
        }
        
        this.goals = new EventData(),
        this.assists = new EventData(),
        this.shots = new EventData(),
        this.faceoffWin = new EventData(),
        this.faceoffLoss = new EventData(),
        this.hits = new EventData(),
        this.tois = new PolledData();
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON() {
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
    static fromJSON(json) {
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

module.exports = Player;