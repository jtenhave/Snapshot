const assert = require("assert");
const samples = require ("../../samples/gameData");
const timeUtils = require("../../../src/common/timeUtils");
const HitEvent = require("../../../src/common/data/events/HitEvent");
const FaceoffEvent = require("../../../src/common/data/events/FaceoffEvent");
const GoalEvent = require("../../../src/common/data/events/GoalEvent");
const ShotEvent = require("../../../src/common/data/events/ShotEvent");
const StoppageEvent = require("../../../src/common/data/events/StoppageEvent");
const GameData = require("../../../src/common/data/GameData");

describe("GameData", () => {
    describe("constructor()", () => {
        it("Initializes GameData", () => {
            const gameData = new GameData(samples.inProgressGameData);

            assert.strictEqual(gameData.id, "2017020445");
            assert.strictEqual(gameData.playoffs, false);
            assert.strictEqual(gameData.time, 3072);
            assert.strictEqual(gameData.teams !== undefined, true);
            assert.strictEqual(gameData.started, true);
        });
    });

    describe("parseTeamData()", () => {
        it("Correctly parses team data", () => {
            const gameData = new GameData();

            gameData.parseTeamData(samples.inProgressGameData);

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
            const event = new FaceoffEvent(samples.finishedGameData.liveData.plays.allPlays[3]);
            const gameData = new GameData();
            gameData.parseTeamData(samples.finishedGameData);

            gameData.parseEvent(event);

            assert.strictEqual(gameData.plays.length === 1, true);
            assert.strictEqual(gameData.plays[0].finished === 1, false);
        });

        it("In-play event starts play if not started", () => {
            const event = new HitEvent(samples.finishedGameData.liveData.plays.allPlays[13]);
            const gameData = new GameData();
            gameData.parseTeamData(samples.finishedGameData);

            gameData.parseEvent(event);

            assert.strictEqual(gameData.plays.length === 1, true);
            assert.strictEqual(gameData.plays[0].finished === 1, false);
        });

        it("In-play event does not start play if last event has same timestamp", () => {
            const event = new HitEvent(samples.finishedGameData.liveData.plays.allPlays[13]);
            const gameData = new GameData();
            const play =  { finished: true, end: event.periodTime };
            gameData.parseTeamData(samples.finishedGameData);
            gameData.plays.push(play);

            gameData.parseEvent(event);

            assert.strictEqual(gameData.plays.length === 1, true);
            assert.strictEqual(gameData.plays[0].finished, true);
        });

        it("Stoppage event stops a play", () => {
            const event = new StoppageEvent(samples.finishedGameData.liveData.plays.allPlays[120]);
            const gameData = new GameData();
            let stopped = false;
            const play = { stop: d => { if (d === event) { stopped = true } } };
            gameData.parseTeamData(samples.finishedGameData);
            gameData.plays.push(play);

            gameData.parseEvent(event);

            assert.strictEqual(stopped, true);
        });

        it("Faceoff event stops a play", () => {
            const event = new FaceoffEvent(samples.finishedGameData.liveData.plays.allPlays[3]);
            const gameData = new GameData();
            let stopped = false;
            const play = { stop: d => { if (d === event) { stopped = true } } };
            gameData.parseTeamData(samples.finishedGameData);
            gameData.plays.push(play);

            gameData.parseEvent(event);

            assert.strictEqual(stopped, true);
        });

        it("Shot event parsed properly", () => {
            const event = new ShotEvent(samples.finishedGameData.liveData.plays.allPlays[4]);
            const gameData = new GameData();
            gameData.parseTeamData(samples.finishedGameData);

            gameData.parseEvent(event);

            const player = gameData.findTeam("MTL").findPlayer("8469521");
            assert.strictEqual(player.shots.times.length === 1, true);
            assert.strictEqual(player.shots.times[0], event.totalTime);
        });

        it("Goal event parsed properly", () => {
            const event = new GoalEvent(samples.finishedGameData.liveData.plays.allPlays[60]);
            const gameData = new GameData();
            gameData.parseTeamData(samples.finishedGameData);

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
            const event = new FaceoffEvent(samples.finishedGameData.liveData.plays.allPlays[3]);
            const gameData = new GameData();
            gameData.parseTeamData(samples.finishedGameData);

            gameData.parseEvent(event);

            const winner = gameData.findTeam("MTL").findPlayer("8469521");
            const loser = gameData.findTeam("BUF").findPlayer("8478403");
            assert.strictEqual(winner.faceoffWin.times.length === 1, true);
            assert.strictEqual(winner.faceoffWin.times[0], event.totalTime);
            assert.strictEqual(loser.faceoffLoss.times.length === 1, true);
            assert.strictEqual(loser.faceoffLoss.times[0], event.totalTime);
        });

        it("Hit event parsed properly", () => {
            const event = new HitEvent(samples.finishedGameData.liveData.plays.allPlays[13]);
            const gameData = new GameData();
            gameData.parseTeamData(samples.finishedGameData);

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
            gameDataA.parseTeamData(samples.finishedGameData);
            gameDataB.parseTeamData(samples.finishedGameData);
            gameDataC.parseTeamData(samples.finishedGameData)
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

            const finished = gameData.isFinished(samples.inProgressGameData);

            assert.strictEqual(finished, false);
        });

        it("Returns false if status code indicates finished but game not over", () => {
            const gameData = new GameData();
            const rawData = JSON.parse(JSON.stringify(samples.inProgressGameData));
            rawData.gameData.status.statusCode = "7";
            gameData.time = 3599;

            const finished = gameData.isFinished(rawData);

            assert.strictEqual(finished, false);
        });

        it("Returns false if status code indicates finished and no winner", () => {
            const gameData = new GameData();
            const rawData = JSON.parse(JSON.stringify(samples.inProgressGameData));
            rawData.gameData.status.statusCode = "7";
            gameData.time = 3601;
            rawData.liveData.linescore.teams.away.goals = 2
            rawData.liveData.linescore.teams.home.goals = 2

            const finished = gameData.isFinished(rawData);

            assert.strictEqual(finished, false);
        });

        it("Returns true if there is a winner", () => {
            const gameData = new GameData();
            const rawData = JSON.parse(JSON.stringify(samples.inProgressGameData));
            rawData.gameData.status.statusCode = "7";
            gameData.time = 3601;

            const finished = gameData.isFinished(rawData);

            assert.strictEqual(finished, true);
        });
     });
});
