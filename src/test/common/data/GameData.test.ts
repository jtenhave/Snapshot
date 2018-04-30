import "mocha";
import * as assert from "assert";
import * as gameSamples from "../../samples/gameData";
import * as scheduleSamples from "../../samples/scheduleData";
import { GameData } from "../../../common/data/GameData";
import { GameTime } from "../../../common/data/GameTime";
import { FaceoffEvent } from "../../../common/data/events/FaceoffEvent";
import { GoalEvent } from "../../../common/data/events/GoalEvent";
import { HitEvent } from "../../../common/data/events/HitEvent";
import { Play } from "../../../common/data/Play";
import { ShotEvent } from "../../../common/data/events/ShotEvent";
import { StoppageEvent } from "../../../common/data/events/StoppageEvent";

describe("GameData", () => {
    describe("constructor()", () => {
        it("Initializes GameData from live endpoint", () => {
            const gameData = new GameData(gameSamples.inProgressGameData);

            assert.strictEqual(gameData.id, "2017020445");
            assert.strictEqual(gameData.playoffs, false);
            assert.strictEqual(gameData.time.totalTime, 3072);
            assert.notStrictEqual(gameData.teams, undefined);
            assert.notStrictEqual(gameData.teams.home, undefined);
            assert.notStrictEqual(gameData.teams.away, undefined);
            assert.notStrictEqual(gameData.plays, undefined);
            assert.strictEqual(gameData.started, true);
            assert.strictEqual(gameData.finished, false);
        });

        it("Initializes GameData from schedule endpoint", () => {
            const gameData = new GameData(scheduleSamples.multiGames.dates[0].games[0]);

            assert.strictEqual(gameData.id, "2017020614");
            assert.strictEqual(gameData.playoffs, false);
            assert.notStrictEqual(gameData.teams, undefined);
            assert.notStrictEqual(gameData.teams.home, undefined);
            assert.notStrictEqual(gameData.teams.away, undefined);
            assert.strictEqual(gameData.started, false);
            assert.strictEqual(gameData.started, false);
        });
    });

    describe("parseTeamData()", () => {
        it("Correctly parses team data", () => {
            const gameData = new GameData();

            gameData.parseTeamData(gameSamples.inProgressGameData);

            const teamA = gameData.findTeam("MTL");
            const teamB = gameData.findTeam("EDM");

            assert.strictEqual(teamA !== undefined, true);
            assert.strictEqual(teamB !== undefined, true);
            assert.strictEqual(teamA.opposition, teamB);
            assert.strictEqual(teamB.opposition, teamA);
        });
    });

    describe("parseEvent()", () => {
        it("Faceoff event starts play", () => {
            const event = new FaceoffEvent(gameSamples.finishedGameData.liveData.plays.allPlays[3]);
            const gameData = new GameData();
            gameData.plays = [];
            gameData.parseTeamData(gameSamples.finishedGameData);

            gameData.parseEvent(event);

            assert.strictEqual(gameData.plays.length === 1, true);
            assert.strictEqual(gameData.plays[0].finished, false);
        });

        it("In-play event starts play if not started", () => {
            const event = new HitEvent(gameSamples.finishedGameData.liveData.plays.allPlays[13]);
            const gameData = new GameData();
            gameData.plays = [];
            gameData.parseTeamData(gameSamples.finishedGameData);

            gameData.parseEvent(event);

            assert.strictEqual(gameData.plays.length === 1, true);
            assert.strictEqual(gameData.plays[0].finished, false);
        });

        it("In-play event does not start play if last event has same timestamp", () => {
            const event = new HitEvent(gameSamples.finishedGameData.liveData.plays.allPlays[13]);
            const gameData = new GameData();
            gameData.plays = [];
            const play =  <Play>{ finished: true, end: event.periodTime };
            gameData.parseTeamData(gameSamples.finishedGameData);
            gameData.plays.push(play);

            gameData.parseEvent(event);

            assert.strictEqual(gameData.plays.length === 1, true);
            assert.strictEqual(gameData.plays[0].finished, true);
        });

        it("Stoppage event stops a play", () => {
            const event = new StoppageEvent(gameSamples.finishedGameData.liveData.plays.allPlays[120]);
            const gameData = new GameData();
            gameData.plays = [];
            let stopped = false;
            const play = <Play>{ stop: d => { if (d === event) { stopped = true } } };
            gameData.parseTeamData(gameSamples.finishedGameData);
            gameData.plays.push(play);

            gameData.parseEvent(event);

            assert.strictEqual(stopped, true);
        });

        it("Faceoff event stops a play", () => {
            const event = new FaceoffEvent(gameSamples.finishedGameData.liveData.plays.allPlays[3]);
            const gameData = new GameData();
            gameData.plays = [];
            let stopped = false;
            const play = <Play>{ stop: d => { if (d === event) { stopped = true } } };
            gameData.parseTeamData(gameSamples.finishedGameData);
            gameData.plays.push(play);

            gameData.parseEvent(event);

            assert.strictEqual(stopped, true);
        });

        it("Shot event parsed properly", () => {
            const event = new ShotEvent(gameSamples.finishedGameData.liveData.plays.allPlays[4]);
            const gameData = new GameData();
            gameData.plays = [];
            gameData.parseTeamData(gameSamples.finishedGameData);

            gameData.parseEvent(event);

            const player = gameData.findTeam("MTL").findPlayer("8469521");
            const goalie = gameData.findTeam("BUF").findPlayer("8475215");
            assert.strictEqual(player.shots.times.length === 1, true);
            assert.strictEqual(player.shots.times[0], event.totalTime);
            assert.strictEqual(goalie.shots.times[0], event.totalTime);
            assert.strictEqual(goalie.blocks.times[0], event.totalTime);
        });

        it("Goal event parsed properly", () => {
            const event = new GoalEvent(gameSamples.finishedGameData.liveData.plays.allPlays[60]);
            const gameData = new GameData();
            gameData.plays = [];
            gameData.parseTeamData(gameSamples.finishedGameData);

            gameData.parseEvent(event);

            const scorer = gameData.findTeam("BUF").findPlayer("8469506");
            const assist = gameData.findTeam("BUF").findPlayer("8476495");
            const goalie = gameData.findTeam("MTL").findPlayer("8471679");
            assert.strictEqual(scorer.shots.times.length === 1, true);
            assert.strictEqual(scorer.shots.times[0], event.totalTime);
            assert.strictEqual(scorer.goals.times.length === 1, true);
            assert.strictEqual(scorer.goals.times[0], event.totalTime);
            assert.strictEqual(assist.assists.times.length === 1, true);
            assert.strictEqual(assist.assists.times[0], event.totalTime);
            assert.strictEqual(goalie.shots.times[0], event.totalTime);
        });

        it("Faceoff event parsed properly", () => {
            const event = new FaceoffEvent(gameSamples.finishedGameData.liveData.plays.allPlays[3]);
            const gameData = new GameData();
            gameData.plays = [];
            gameData.parseTeamData(gameSamples.finishedGameData);

            gameData.parseEvent(event);

            const winner = gameData.findTeam("MTL").findPlayer("8469521");
            const loser = gameData.findTeam("BUF").findPlayer("8478403");
            assert.strictEqual(winner.faceoffWin.times.length === 1, true);
            assert.strictEqual(winner.faceoffWin.times[0], event.totalTime);
            assert.strictEqual(loser.faceoffLoss.times.length === 1, true);
            assert.strictEqual(loser.faceoffLoss.times[0], event.totalTime);
        });

        it("Hit event parsed properly", () => {
            const event = new HitEvent(gameSamples.finishedGameData.liveData.plays.allPlays[13]);
            const gameData = new GameData();
            gameData.plays = [];
            gameData.parseTeamData(gameSamples.finishedGameData);

            gameData.parseEvent(event);

            const player = gameData.findTeam("MTL").findPlayer("8470642");
            assert.strictEqual(player.hits.times.length === 1, true);
            assert.strictEqual(player.hits.times[0], event.totalTime);
        });
    });

    describe("merge()", () => {
        it("Merges TOI properly", () => {
            const gameDataA = new GameData();
            const gameDataB = new GameData();
            const gameDataC = new GameData();
            gameDataA.parseTeamData(gameSamples.finishedGameData);
            gameDataB.parseTeamData(gameSamples.finishedGameData);
            gameDataC.parseTeamData(gameSamples.finishedGameData)
            const playerA = gameDataA.findTeam("MTL").findPlayer("8470642");
            playerA.tois.addValue(600, 300);
            const playerB = gameDataB.findTeam("MTL").findPlayer("8470642");
            playerB.toi = 500;
            const playerC = gameDataC.findTeam("MTL").findPlayer("8470642");
            playerC.toi = 600;
            gameDataB.time = new GameTime(1, 900);
            gameDataC.time = new GameTime(1, 1000);;

            gameDataB.merge(gameDataA);
            gameDataC.merge(gameDataB);

            assert.strictEqual(playerC.tois.times.length === 3, true);
            assert.strictEqual(playerC.tois.values.length === 3, true);
            assert.strictEqual(playerC.tois.times[0], 600);
            assert.strictEqual(playerC.tois.times[1], 900);
            assert.strictEqual(playerC.tois.times[2], 1000);
            assert.strictEqual(playerC.tois.values[0], 300);
            assert.strictEqual(playerC.tois.values[1], 500);
            assert.strictEqual(playerC.tois.values[2], 600);
        });
    });

    describe("parseTotalTime()", () => {
        it("Returns correct value", () => {
            const gameData = new GameData();
            gameData.playoffs = false;
            const rawData = {
                liveData: {
                    linescore: {
                        currentPeriod: 2,
                        currentPeriodTimeRemaining: "15:34"
                    }
                }
            }

            const result = gameData.parseTotalTime(rawData);

            assert.strictEqual(result.totalTime, 1466);
        });

        it("Returns correct value when period is 'END'", () => {
            const gameData = new GameData();
            gameData.playoffs = false;
            const rawData = {
                liveData: {
                    linescore: {
                        currentPeriod: 1,
                        currentPeriodTimeRemaining: "END"
                    }
                }
            }

            const result = gameData.parseTotalTime(rawData);

            assert.strictEqual(result.totalTime, 1200);
        });

        it("Returns correct value when period is 'Final'", () => {
            const gameData = new GameData();
            gameData.playoffs = false;
            const rawData = {
                liveData: {
                    linescore: {
                        currentPeriod: 3,
                        currentPeriodTimeRemaining: "Final"
                    }
                }
            }

            const result = gameData.parseTotalTime(rawData);

            assert.strictEqual(result.totalTime, 3600);
        });

        it("Returns correct value when period is undefined", () => {
            const gameData = new GameData();
            gameData.playoffs = false;
            const rawData = {
                liveData: {
                    linescore: {
                        currentPeriod: 4
                    }
                }
            }

            const result = gameData.parseTotalTime(rawData);

            assert.strictEqual(result.totalTime, 3600);
        });

        it("Returns correct value when in regular season overtime", () => {
            const gameData = new GameData();
            gameData.playoffs = false;
            const rawData = {
                liveData: {
                    linescore: {
                        currentPeriod: 4,
                        currentPeriodTimeRemaining: "3:34"
                    }
                }
            }

            const result = gameData.parseTotalTime(rawData);

            assert.strictEqual(result.totalTime, 3600 + 60 + 26);
        });

        it("Returns correct value when in regular season overtime not started", () => {
            const gameData = new GameData();
            gameData.playoffs = false;
            const rawData = {
                liveData: {
                    linescore: {
                        currentPeriod: 4,
                        currentPeriodTimeRemaining: undefined
                    }
                }
            }

            const result = gameData.parseTotalTime(rawData);

            assert.strictEqual(result.totalTime, 3600);
        });

        it("Returns correct value when in regular season shootout", () => {
            const gameData = new GameData();
            gameData.playoffs = false;
            const rawData = {
                liveData: {
                    linescore: {
                        currentPeriod: 5,
                        currentPeriodTimeRemaining: undefined
                    }
                }
            }

            const result = gameData.parseTotalTime(rawData);

            assert.strictEqual(result.totalTime, 3600);
        });
    });

    describe("isFinished()", () => {
        it("Returns false for not finished status code", () => {
            const gameData = new GameData();

            const finished = gameData.isFinished(gameSamples.inProgressGameData);

            assert.strictEqual(finished, false);
        });

        it("Returns false if status code indicates finished but game not over", () => {
            const gameData = new GameData();
            const rawData = JSON.parse(JSON.stringify(gameSamples.inProgressGameData));
            rawData.gameData.status.statusCode = "7";
            gameData.time = new GameTime(3, 1199);

            const finished = gameData.isFinished(rawData);

            assert.strictEqual(finished, false);
        });

        it("Returns false if status code indicates finished and no winner", () => {
            const gameData = new GameData();
            const rawData = JSON.parse(JSON.stringify(gameSamples.inProgressGameData));
            rawData.gameData.status.statusCode = "7";
            gameData.time = new GameTime(4,1);
            rawData.liveData.linescore.teams.away.goals = 2
            rawData.liveData.linescore.teams.home.goals = 2

            const finished = gameData.isFinished(rawData);

            assert.strictEqual(finished, false);
        });

        it("Returns true if there is a winner", () => {
            const gameData = new GameData();
            const rawData = JSON.parse(JSON.stringify(gameSamples.inProgressGameData));
            rawData.gameData.status.statusCode = "7";
            gameData.time = new GameTime(4,1);

            const finished = gameData.isFinished(rawData);

            assert.strictEqual(finished, true);
        });
    });

    describe("toJSON()", () => {
        it("Returns correct JSON", () => {
            const gameData = new GameData(gameSamples.inProgressGameData);
            
            const json = gameData.toJSON();

            assert.strictEqual(json._id, "2017020445");
            assert.strictEqual(json.po, false);
            assert.notStrictEqual(json.t, undefined);
            assert.notStrictEqual(json.t.a, undefined);
            assert.notStrictEqual(json.t.h, undefined);
            assert.strictEqual(json.p.length, gameData.plays.length);
            assert.strictEqual(json.s, true);
            assert.strictEqual(json.f, false);
        });
    });

    describe("fromJSON()", () => {
        it("Returns correct GameData", () => {
            const initialGameData = new GameData(gameSamples.inProgressGameData);
            const json = initialGameData.toJSON();

            const parsedGameData = GameData.fromJSON(json);

            assert.strictEqual(parsedGameData.id, "2017020445");
            assert.strictEqual(parsedGameData.playoffs, false);
            assert.notStrictEqual(parsedGameData.teams, undefined);
            assert.notStrictEqual(parsedGameData.teams.home, undefined);
            assert.notStrictEqual(parsedGameData.teams.away, undefined);
            assert.notStrictEqual(parsedGameData.plays, undefined);
            assert.strictEqual(parsedGameData.started, true);
            assert.strictEqual(parsedGameData.finished, false);
        });

        it("Does not parse play in short mode", () => {
            const initialGameData = new GameData(gameSamples.inProgressGameData);
            const json = initialGameData.toJSON();

            const parsedGameData = GameData.fromJSON(json, true);

            assert.strictEqual(parsedGameData.id, "2017020445");
            assert.strictEqual(parsedGameData.playoffs, false);
            assert.notStrictEqual(parsedGameData.teams, undefined);
            assert.notStrictEqual(parsedGameData.teams.home, undefined);
            assert.notStrictEqual(parsedGameData.teams.away, undefined);
            assert.strictEqual(parsedGameData.teams.away.players, undefined);
            assert.strictEqual(parsedGameData.teams.home.players, undefined);
            assert.strictEqual(parsedGameData.plays, undefined);
            assert.strictEqual(parsedGameData.started, true);
            assert.strictEqual(parsedGameData.finished, false);
        });
    });

    describe("periodCount()", () => {
        it("Returns correct period count for no plays", () => {
            const gameData = new GameData();

            assert.strictEqual(gameData.periodCount, 1);

            gameData.plays = [];

            assert.strictEqual(gameData.periodCount, 1);
        });

        it("Returns correct period count", () => {
            const gameData = new GameData();
            gameData.plays = <any>[{ period: 2}];

            assert.strictEqual(gameData.periodCount, 2);
        });

        it("Returns correct period count for shootout game", () => {
            const gameData = new GameData();
            gameData.plays = <any>[{ period: 5}];
            gameData.playoffs = false;

            assert.strictEqual(gameData.periodCount, 4);
        });

        it("Returns correct period count for playoff game", () => {
            const gameData = new GameData();
            gameData.plays = <any>[{ period: 5}];
            gameData.playoffs = true;

            assert.strictEqual(gameData.periodCount, 5);
        });
    });

    describe("calculateGameTime()", () => {
        it("Returns game start is timestamp is before any play", () => {
            const gameData = new GameData();
            gameData.plays = <any>[{ startTimestamp: 123}];

            const gameTime = gameData.calculateGameTime(100);

            assert.strictEqual(gameTime.period, 1);
            assert.strictEqual(gameTime.time, 0);
            assert.strictEqual(gameTime.totalTime, 0);
        });

        it("Returns correct time if timestamp falls in a play", () => {
            const gameData = new GameData();
            gameData.plays = <any>[{ startTimestamp: 5000, endTimestamp: 20000, start: 5, period: 2}];

            const gameTime = gameData.calculateGameTime(11000);

            assert.strictEqual(gameTime.period, 2);
            assert.strictEqual(gameTime.time, 11);
            assert.strictEqual(gameTime.totalTime, 1211);
        });

        it("Returns correct time if timestamp falls between plays", () => {
            const gameData = new GameData();
            gameData.plays = <any>[{ startTimestamp: 5000, endTimestamp: 10000, start: 5, period: 2},
                { startTimestamp: 15000, endTimestamp: 20000}];

            const gameTime = gameData.calculateGameTime(12500);

            assert.strictEqual(gameTime.period, 2);
            assert.strictEqual(gameTime.time, 10);
            assert.strictEqual(gameTime.totalTime, 1210);
        });

        it("Returns correct time if timestamp falls in intermission", () => {
            const gameData = new GameData();
            gameData.plays = <any>[{ startTimestamp: 5000, endTimestamp: 10000, start: 1195, period: 2}];

            const gameTime = gameData.calculateGameTime(20000);

            assert.strictEqual(gameTime.period, 2);
            assert.strictEqual(gameTime.time, 1200);
            assert.strictEqual(gameTime.totalTime, 2400);
        });
    });
});
