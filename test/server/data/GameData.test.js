const assert = require("assert");
const samples = require ("../../samples/gameData");
const rewire = require("rewire");
const timeUtils = require("../../../src/common/timeUtils.js");
const gameDataModule= rewire("../../../src/server/data/GameData.js");

describe("GameData", () => {
    const GameData = gameDataModule.__get__("GameData");
    describe("parseGameEvents()", () => {
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
    });
});
