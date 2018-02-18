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

            assert.strictEqual(gameData._id, "2017020445");
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

            assert.strictEqual(gameData.teams["MTL"] !== undefined, true);
            assert.strictEqual(gameData.teams["EDM"] !== undefined, true);
            assert.strictEqual(gameData.teams["MTL"].id, "MTL");
            assert.strictEqual(gameData.teams["EDM"].id, "EDM");
            assert.strictEqual(gameData.teams["MTL"].opposition, gameData.teams["EDM"]);
            assert.strictEqual(gameData.teams["EDM"].opposition, gameData.teams["MTL"]);
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

            const player = gameData.teams["MTL"].findPlayer("8469521");
            assert.strictEqual(player.shots.times.length === 1, true);
            assert.strictEqual(player.shots.times[0], event.totalTime);
        });

        it("Goal event parsed properly", () => {
            const event = new GoalEvent(samples.finishedGameData.liveData.plays.allPlays[60]);
            const gameData = new GameData();
            gameData.parseTeamData(samples.finishedGameData);

            gameData.parseEvent(event);

            const scorer = gameData.teams["BUF"].findPlayer("8469506");
            const assist = gameData.teams["BUF"].findPlayer("8476495");
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

            const winner = gameData.teams["MTL"].findPlayer("8469521");
            const loser = gameData.teams["BUF"].findPlayer("8478403");
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

            const player = gameData.teams["MTL"].findPlayer("8470642");
            assert.strictEqual(player.hits.times.length === 1, true);
            assert.strictEqual(player.hits.times[0], event.totalTime);
        });
    });

    describe("merge()", () => {
        it("Merges TOI properly", () => {
            const gameDataA = new GameData();
            const gameDataB = new GameData();
            gameDataA.parseTeamData(samples.finishedGameData);
            gameDataB.parseTeamData(samples.finishedGameData);
            const playerA = gameDataA.teams["MTL"].findPlayer("8470642");
            playerA.tois.addValue(600, 300);
            const playerB = gameDataB.teams["MTL"].findPlayer("8470642");
            playerB.toi = 500;
            gameDataB.time = 900;

            gameDataB.merge(gameDataA);

            assert.strictEqual(playerB.tois.times.length === 2, true);
            assert.strictEqual(playerB.tois.values.length === 2, true);
            assert.strictEqual(playerB.tois.times[0], 600);
            assert.strictEqual(playerB.tois.times[1], 900);
            assert.strictEqual(playerB.tois.values[0], 300);
            assert.strictEqual(playerB.tois.values[1], 500);
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

    /*describe("parseGameEvents()", () => {
        it("Play is initiated by a play events", function() {
            const playEvents = samples.finishedGameData.liveData.plays.allPlays
                .filter(e => GameData.isPlay(e));

            const gameData = new GameData();
            gameData.playoffs = false;
            gameData.parseGameEvents(samples.finishedGameData);
    
            assert.strictEqual(gameData.plays.length, playEvents.length);
            for (var i = 0; i < gameData.plays.length; i++) {
                assert.strictEqual(gameData.plays[i].start, timeUtils.toSeconds(playEvents[i].about.periodTime));
            }
        });

        it("Play stopped by play events if play is in progress", function() {
            const abruptStoppageEvents = [];
            const allEvents = samples.finishedGameData.liveData.plays.allPlays;
            let inPlay = false;
            for (let i = 0; i < allEvents.length; i++) {
                const event = allEvents[i];
                if (event.about.period >= 5) {
                    break;
                }

                if (GameData.isPlay(event) && inPlay) {
                    abruptStoppageEvents.push(event);
                    inPlay = false;
                }

                if (GameData.isStoppage(event)) {
                    inPlay = false;
                }

                if (!inPlay && GameData.isPlay(event)) {
                    inPlay = true;
                }
            }

            const gameData = new GameData();
            gameData.playoffs = false;
            gameData.parseGameEvents(samples.finishedGameData);
            const plays = gameData.plays.filter(e => !e.hasStoppage);

            assert.strictEqual(plays.length, abruptStoppageEvents.length);
            for (var i = 0; i < plays.length; i++) {
                assert.strictEqual(plays[i].end, timeUtils.toSeconds(abruptStoppageEvents[i].about.periodTime)); 
            }
        });

        it("Play stopped by stoppage events", function() {
            const stoppageEvents = [];
            const allEvents = samples.finishedGameData.liveData.plays.allPlays;
            let inPlay = false;
            for (let i = 0; i < allEvents.length; i++) {
                const event = allEvents[i];
                if (event.about.period >= 5) {
                    break;
                }

                if (GameData.isStoppage(event)) {
                    inPlay = false;
                    stoppageEvents.push(event);
                }

                if (GameData.isPlay(event)) {
                    inPlay = true;
                }
            }

            const gameData = new GameData();
            gameData.playoffs = false;
            gameData.parseGameEvents(samples.finishedGameData);
            const plays = gameData.plays.filter(e => e.hasStoppage);

            assert.strictEqual(plays.length, stoppageEvents.length);
            for (var i = 0; i < plays.length; i++) {
                assert.strictEqual(plays[i].end, timeUtils.toSeconds(stoppageEvents[i].about.periodTime)); 
            }
        });
    });*/
});
