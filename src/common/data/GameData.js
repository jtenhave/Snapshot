const FaceoffEvent = require("./events/FaceoffEvent");
const Event = require("./events/Event");
const GoalEvent = require("./events/GoalEvent");
const HitEvent = require("./events/HitEvent");
const Play = require("./Play");
const Player = require("./Player");
const ShotEvent = require("./events/ShotEvent");
const Team = require("./Team");
const timeUtils = require("../timeUtils");

/**
 * Class that represents advanced data about a game.
 */
class GameData {

    constructor(rawData) {
        this.plays = [];
        if (rawData) {
            this._id = rawData.gamePk.toString();
            this.playoffs = rawData.gameData.game.type === "P";
            this.time = timeUtils.toTotalTime(rawData.liveData.linescore.currentPeriodTimeRemaining, rawData.liveData.linescore.currentPeriod - 1, true);
            this.finished = this.isFinished(rawData);
            this.parseTeamData(rawData);
            this.parseGameEvents(rawData);
        }    
    }

    /**
     * Parses events from raw NHL API data.
     */
    parseGameEvents(rawData) {
        const allEvents = rawData.liveData.plays.allPlays.map(p => Event.create(p)).filter(e => e);
        for (let event of allEvents) {
            this.parseEvent(event);
        }

        this.started = this.plays.length > 0;
    }

    /**
     * Parses a game event.
     */
    parseEvent(event) {
        // Do not parse events that are beyond overtime.
        if (!this.playoffs && event.period >= 5) {
            return;
        }

        const team = this.teams[event.team];
        const lastPlay = this.plays.length ? this.plays[this.plays.length - 1] : undefined;
        const inPlay = lastPlay ? !lastPlay.finished : false;
        
        // Data from NHL API won't always have stoppage events. It can also have multiple
        // stoppage events in a row.
        if (inPlay && (event.isPlayStopEvent || event.isPlayStartEvent)) {
            lastPlay.stop(event);
        }

        // Data from NHL API won't always have faceoff events. Occasionally an in-play
        // event will occur at the same time as a stoppage event, but will come after. 
        if (!inPlay) {
            const abruptStart = (event.isInPlayEvent && (!lastPlay || lastPlay.end !== event.periodTime));
            if (event.isPlayStartEvent || abruptStart) {
                this.plays.push(Play.start(event));
            }
        }

        // Shot event.
        if (event instanceof ShotEvent) {
            const shooter = team.findPlayer(event.shooter);
            shooter.shots.addTime(event.totalTime);
        }

        // Goal event.
        if (event instanceof GoalEvent) {
            const scorer = team.findPlayer(event.scorer);
            const assistants = event.assistants.map(a => team.findPlayer(a));

            scorer.goals.addTime(event.totalTime);
            scorer.shots.addTime(event.totalTime);

            for (const assistant of assistants) {
                assistant.assists.addTime(event.totalTime);
            }     
        }

        // Faceoff event.
        if (event instanceof FaceoffEvent) {
            const winner = team.findPlayer(event.winner);
            const loser = team.opposition.findPlayer(event.loser);
            
            winner.faceoffWin.addTime(event.totalTime);
            loser.faceoffLoss.addTime(event.totalTime);
        }

        // Hit event.
        if (event instanceof HitEvent) {
            const hitter = team.findPlayer(event.hitter);;
            hitter.hits.addTime(event.totalTime);
        }
    }

    /**
     * Parses team data from raw NHL API data.
     */
    parseTeamData(rawData) {
        this.teams = {};
        const away = new Team(rawData.liveData.boxscore.teams.away);
        const home = new Team(rawData.liveData.boxscore.teams.home);
        home.opposition = away;
        away.opposition = home;

        this.teams[away.id] = away;
        this.teams[home.id] = home;
    }

    /**
     * Merge this data object with another one. This only applies to polled data.
     */
    merge(gameData) {
        
        for (const teamId of Object.keys(this.teams)) {
            // Merge player data.
            for (const player of this.teams[teamId].players) {    
                var playerSource = gameData.teams[teamId].findPlayer(player.id);

                // Merge TOI.
                player.tois = playerSource.tois;
                player.tois.addValue(this.time, player.toi)
            }
        }
    }

    /**
     * Checks if a game is finished.
     */
    isFinished(rawData) {
        // It's possible that the game is not over even with this status code.
        if (rawData.gameData.status.statusCode !== "7") {
            return false;
        }

        // Check if the third period is over.
        if (this.time < 3600) {
            return false;
        }

        // Finally, Check if there is a winner.
        const awayGoals = rawData.liveData.linescore.teams.away.goals;
        const homeGoals = rawData.liveData.linescore.teams.home.goals;
        
        return homeGoals != awayGoals;
    }

    /**
     * Converts game data to minified json.
     */
    toJSON() {
        return {
            _id: this._id,
            plays: this.plays.map(p => p.toJSON()),
            teams: Object.keys(this.teams).map(k => this.teams[k].toJSON())
        }
    }
}

module.exports = GameData;
