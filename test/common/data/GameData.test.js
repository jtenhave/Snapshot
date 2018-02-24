const assert = require("assert");
const gameSamples = require ("../../samples/gameData");
const scheduleSamples = require ("../../samples/scheduleData");
const timeUtils = require("../../../src/common/timeUtils");
const HitEvent = require("../../../src/common/data/events/HitEvent");
const FaceoffEvent = require("../../../src/common/data/events/FaceoffEvent");
const GoalEvent = require("../../../src/common/data/events/GoalEvent");
const ShotEvent = require("../../../src/common/data/events/ShotEvent");
const StoppageEvent = require("../../../src/common/data/events/StoppageEvent");
const GameData = require("../../../src/common/data/GameData");

describe("GameData", () => {
    describe("constructor()", () => {
        it("Initializes GameData from live endpoint", () => {
            const gameData = new GameData(gameSamples.inProgressGameData);

            assert.strictEqual(gameData.id, "2017020445");
            assert.strictEqual(gameData.playoffs, false);
            assert.strictEqual(gameData.time, 3072);
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
            assert.strictEqual(gameData.plays[0].finished === 1, false);
        });

        it("In-play event starts play if not started", () => {
            const event = new HitEvent(gameSamples.finishedGameData.liveData.plays.allPlays[13]);
            const gameData = new GameData();
            gameData.plays = [];
            gameData.parseTeamData(gameSamples.finishedGameData);

            gameData.parseEvent(event);

            assert.strictEqual(gameData.plays.length === 1, true);
            assert.strictEqual(gameData.plays[0].finished === 1, false);
        });

        it("In-play event does not start play if last event has same timestamp", () => {
            const event = new HitEvent(gameSamples.finishedGameData.liveData.plays.allPlays[13]);
            const gameData = new GameData();
            gameData.plays = [];
            const play =  { finished: true, end: event.periodTime };
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
            const play = { stop: d => { if (d === event) { stopped = true } } };
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
            const play = { stop: d => { if (d === event) { stopped = true } } };
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
            assert.strictEqual(player.shots.times.length === 1, true);
            assert.strictEqual(player.shots.times[0], event.totalTime);
        });

        it("Goal event parsed properly", () => {
            const event = new GoalEvent(gameSamples.finishedGameData.liveData.plays.allPlays[60]);
            const gameData = new GameData();
            gameData.plays = [];
            gameData.parseTeamData(gameSamples.finishedGameData);

            gameData.parseEvent(event);

            const scorer = gameData.findTeam("BUF").findPlayer("8469506");
            const assist = gameData.findTeam("BUF").findPlayer("8476495");
            assert.strictEqual(scorer.shots.times.length === 1, true);
            assert.strictEqual(scorer.shots.times[0], event.totalTime);
            assert.strictEqual(scorer.goals.times.length === 1, true);
            assert.strictEqual(scorer.goals.times[0], event.totalTime);
            assert.strictEqual(assist.assists.times.length === 1, true);
            assert.strictEqual(assist.assists.times[0], event.totalTime);
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
            gameDataB.time = 900;
            gameDataC.time = 1000;

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
        it("Returns correct value when period", () => {
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

            assert.strictEqual(result, 1466);
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

            assert.strictEqual(result, 1200);
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

            assert.strictEqual(result, 3600);
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

            assert.strictEqual(result, 3600);
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
            gameData.time = 3599;

            const finished = gameData.isFinished(rawData);

            assert.strictEqual(finished, false);
        });

        it("Returns false if status code indicates finished and no winner", () => {
            const gameData = new GameData();
            const rawData = JSON.parse(JSON.stringify(gameSamples.inProgressGameData));
            rawData.gameData.status.statusCode = "7";
            gameData.time = 3601;
            rawData.liveData.linescore.teams.away.goals = 2
            rawData.liveData.linescore.teams.home.goals = 2

            const finished = gameData.isFinished(rawData);

            assert.strictEqual(finished, false);
        });

        it("Returns true if there is a winner", () => {
            const gameData = new GameData();
            const rawData = JSON.parse(JSON.stringify(gameSamples.inProgressGameData));
            rawData.gameData.status.statusCode = "7";
            gameData.time = 3601;

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
});
