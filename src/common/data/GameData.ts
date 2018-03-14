import { Event } from "./events/Event";
import { BlockedShotEvent } from "./events/BlockedShotEvent";
import { FaceoffEvent } from "./events/FaceoffEvent";
import { GoalEvent } from "./events/GoalEvent";
import { HitEvent } from "./events/HitEvent";
import { Play } from "./Play";
import { ShotEvent } from "./events/ShotEvent";
import { Team } from "./Team";
import { TimeUtils } from "../TimeUtils";

/**
 * Represents a point in the game.
 */
export interface GameTime {

    /**
     * Current period in the game.
     */
    period: number;

    /**
     * Time elapsed in the current period.
     */
    time: number;

    /**
     * Time elapsed in the game.
     */
    totalTime: number;
}

/**
 * Class that represents advanced data about a game.
 */
export class GameData {

    /**
     * Game ID.
     */
    id: string;

    /**
     * Date of the game.
     */
    date: Date;

    /**
     * Whether this is a playoff game.
     */
    playoffs: boolean;

    /**
     * Whether the game is finished.
     */
    finished: boolean;

    /**
     * Whether the game has started.
     */
    started: boolean;

    /**
     * Teams in the game.
     */
    teams: { home: Team, away: Team };

    /**
     * Time elapsed in the game.
     */
    time: number;

    /**
     * Plays in the game.
     */
    plays: Play[];

    /**
     * Number of periods available in the live data.
     */
    get periodCount(): number {
        const length = this.plays && this.plays.length;
        if (!length) {
            return 1;
        }
     
        let periods = this.plays[length - 1].period;
        if (!this.playoffs && periods > 4) {
            periods = 4;
        }
     
        return periods;
    }

    constructor(rawData?: any) {
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
    parseFromScheduleData(rawData: any): void {
        this.id = rawData.gamePk.toString();
        this.date = new Date(rawData.gameDate);
        this.playoffs = rawData.gameType === "P";
        this.finished = false;
        this.started = false;
        this.teams = {
            away: new Team(rawData.teams.away),
            home: new Team(rawData.teams.home)
        };
    }

    /**
     * Parses raw NHL API game data from a the live endpoint.
     */
    parseFromLiveData(rawData: any): void {
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
    parseGameEvents(rawData: any): void {
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
    parseEvent(event: Event): void {
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
            const goalie = team.opposition.findPlayer(event.goalie);
            shooter && shooter.shots.addTime(event.totalTime);
            goalie && goalie.shots.addTime(event.totalTime);
            goalie && goalie.blocks.addTime(event.totalTime);
        }

        // Goal event.
        if (event instanceof GoalEvent) {
            const scorer = team.findPlayer(event.scorer);
            const assistants = event.assistants.map(a => team.findPlayer(a));
            const goalie = team.opposition.findPlayer(event.goalie);

            scorer && scorer.goals.addTime(event.totalTime);
            scorer && scorer.shots.addTime(event.totalTime);
            
            for (const assistant of assistants) {
                assistant && assistant.assists.addTime(event.totalTime);
            }

            if (goalie) {
                goalie && goalie.shots.addTime(event.totalTime);
            }
        }

        // Faceoff event.
        if (event instanceof FaceoffEvent) {
            const winner = team.findPlayer(event.winner);
            const loser = team.opposition.findPlayer(event.loser);
            
            winner && winner.faceoffWin.addTime(event.totalTime);
            loser && loser.faceoffLoss.addTime(event.totalTime);
        }

        // Hit event.
        if (event instanceof HitEvent) {
            const hitter = team.findPlayer(event.hitter);;
            hitter && hitter.hits.addTime(event.totalTime);
        }

        // Block event.
        if (event instanceof BlockedShotEvent) {
            const blocker = team.findPlayer(event.blocker);
            blocker && blocker.blocks.addTime(event.totalTime);
        }
    }

    /**
     * Parses team data from raw NHL API data.
     */
    parseTeamData(rawData: any): void {
        this.teams = {
            away: new Team(rawData.liveData.boxscore.teams.away),
            home: new Team(rawData.liveData.boxscore.teams.home)
        };
        this.teams.home.opposition = this.teams.away;
        this.teams.away.opposition = this.teams.home;
    }

    /**
     * Parse the total elapsed time in the game.
     */
    parseTotalTime(rawData: any): number {
        let period: number = rawData.liveData.linescore.currentPeriod;
        let time = rawData.liveData.linescore.currentPeriodTimeRemaining;
        
        if (time === "END" || time == "Final") {
            time = "0:00";
        }

        if (!this.playoffs && period > 4) {
            period = 4;
        }
        
        const ot = !this.playoffs && period === 4;
        if (time == undefined) {
            time = ot ? "5:00" : "20:00";
        }

        return TimeUtils.toTotalTime(time, period - 1, true, ot);
    }

    /**
     * Merge this data object with another one. This only applies to polled data.
     */
    merge(gameData: GameData): void { 
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
    isFinished(rawData: any): boolean {
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
    findTeam(id: string): Team {
        return this.teams.away.id === id ? this.teams.away : this.teams.home;
    }

    /**
     * Calculate the current game time given a timestamp.
     */
    calculateGameTime(timestamp: number): GameTime {
        var index = this.plays.findIndex(p => p.startTimestamp > timestamp);
        if (index < 0) {
            index = this.plays.length;
        } else if (index === 0) {
            return {
                period: 1,
                time: 0,
                totalTime: 0
            };
        }
     
        var play = this.plays[index - 1];

        // Check if the timestamp falls between plays.
        if (play.endTimestamp && play.endTimestamp < timestamp) {
            timestamp = play.endTimestamp;
        }
     
        var seconds = play.start + (timestamp - play.startTimestamp) / TimeUtils.MILLISECONDS;
        seconds = Math.min(seconds, TimeUtils.PERIOD_LEN);
     
        return {
            period: play.period,
            time: seconds,
            totalTime: (play.period - 1) * TimeUtils.PERIOD_LEN + seconds
        };
    }

    /**
     * Converts game data to minified json.
     */
    toJSON(): any {
        const json: any = {
            _id: this.id,
            t: { a: this.teams.away.toJSON(), h: this.teams.home.toJSON() },
            po: this.playoffs,
            s: this.started,
            f: this.finished,
            d: this.date,
            ti: this.time
        }

        if (this.plays) {
            json.p = this.plays.map(p => p.toJSON());
        }

        return json;
    }

    /**
     * Creates a GameData from a minified JSON object.
     */
    static fromJSON(json: any, short?: boolean): GameData {
        const gameData = new GameData();
        gameData.id = json._id;
        gameData.teams = { away: Team.fromJSON(json.t.a, short), home: Team.fromJSON(json.t.h, short) };
        gameData.playoffs = json.po;
        gameData.started = json.s;
        gameData.finished = json.f;
        gameData.date = json.d;
        gameData.time = json.ti;

        if (json.p && !short) {
            gameData.plays = json.p.map(p => Play.fromJSON(p));
        }

        return gameData;
    }
}
