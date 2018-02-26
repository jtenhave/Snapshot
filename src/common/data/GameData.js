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
        if (rawData) {
            if (rawData.gameData) {
                this.parseFromLiveData(rawData);
            } else {
                this.parseFromScheduleData(rawData);
            }
        }    
    }

    /**
     * Parses raw NHL API game data from a the schedule endpoint.
     */
    parseFromScheduleData(rawData) {
        this.id = rawData.gamePk.toString();
        this.date = new Date(rawData.gameDate);
        this.playoffs = rawData.gameType === "P";
        this.finished = false;
        this.started = false;
        this.teams = {};
        this.teams.away = new Team(rawData.teams.away);
        this.teams.home = new Team(rawData.teams.home);
    }

    /**
     * Parses raw NHL API game data from a the live endpoint.
     */
    parseFromLiveData(rawData) {
        this.id = rawData.gamePk.toString();
        this.date = new Date(rawData.gameData.datetime.dateTime);
        this.playoffs = rawData.gameData.game.type === "P";
        this.time = this.parseTotalTime(rawData);
        this.finished = this.isFinished(rawData);
        this.parseTeamData(rawData);
        this.parseGameEvents(rawData);
    }

    /**
     * Parses events from raw NHL API data.
     */
    parseGameEvents(rawData) {
        this.plays = [];
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

        const team = this.findTeam(event.team);
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
        this.teams.away = new Team(rawData.liveData.boxscore.teams.away);
        this.teams.home = new Team(rawData.liveData.boxscore.teams.home);
        this.teams.home.opposition = this.teams.away;
        this.teams.away.opposition = this.teams.home;
    }

    /**
     * Parse the total elapsed time in the game.
     */
    parseTotalTime(rawData) {
        const period = rawData.liveData.linescore.currentPeriod;
        let time = rawData.liveData.linescore.currentPeriodTimeRemaining;
        
        if (time === "END" || time == "Final") {
            time = "0:00";
        }
    
        if (time == undefined) {
            time = "20:00";
        }

        return timeUtils.toTotalTime(time, period - 1, true);
    }

    /**
     * Merge this data object with another one. This only applies to polled data.
     */
    merge(gameData) { 
        for (const team of [this.teams.away, this.teams.home]) {
            const teamSource = gameData.findTeam(team.id);
            // Merge player data.
            for (const player of team.players) {    
                var playerSource = teamSource.findPlayer(player.id);
                if (playerSource) {
                    // Merge TOI.
                    player.tois = playerSource.tois;
                    player.tois.addValue(this.time, player.toi);
                } 
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
     * Returns the team matching the given id.
     */
    findTeam(id) {
        return this.teams.away.id === id ? this.teams.away : this.teams.home;
    }

    /**
     * Converts game data to minified json.
     */
    toJSON() {
        const json = {
            _id: this.id,
            t: { a: this.teams.away.toJSON(), h: this.teams.home.toJSON() },
            po: this.playoffs,
            s: this.started,
            f: this.finished,
            d: this.date
        }

        if (this.plays) {
            json.p = this.plays.map(p => p.toJSON());
        }

        return json;
    }

    /**
     * Creates a GameData from a minified JSON object.
     */
    static fromJSON(json, short) {
        const gameData = new GameData();
        gameData.id = json._id;
        gameData.teams = { away: Team.fromJSON(json.t.a, short), home: Team.fromJSON(json.t.h, short) };
        gameData.playoffs = json.po;
        gameData.started = json.s;
        gameData.finished = json.f;
        gameData.date = json.d

        if (json.p && !short) {
            gameData.plays = json.p.map(p => Play.fromJSON(p));
        }

        return gameData;
    }
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = GameData;
}
