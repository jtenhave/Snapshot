var assert = require("assert");
var rewire = require("rewire");
var samples = require ("../samples/gameData");

var gameUtils = rewire("../../src/server/gameUtils.js");

describe('gameUtils', function() {
    describe('parseGameData()', function() {
        const toPeriodTime = gameUtils.__get__("toPeriodTime");
        it("Converts period time string to numeric value.", function() {
            assert.strictEqual(toPeriodTime("00:00"), 0);
            assert.strictEqual(toPeriodTime("10:31"), 631);
            assert.strictEqual(toPeriodTime("20:00"), 1200);
        });
    });

    describe('parseGameData()', function() {
        const parseGameData = gameUtils.__get__("parseGameData");
        it("Parses general game properties correctly for finished game", function() {
            const result = parseGameData(samples.finishedGameData);
    
            assert.strictEqual(result.encodedGameTime === undefined, false);
            assert.strictEqual(result.playoffs, false);
            assert.strictEqual(result.finished, true);
        });

        it("Parses general game properties correctly for in-progress game", function() {
            const result = parseGameData(samples.inProgressGameData);
    
            assert.strictEqual(result.encodedGameTime === undefined, false);
            assert.strictEqual(result.playoffs, false);
            assert.strictEqual(result.finished, false);
        });
    });

    describe('parseGameTime()', function() {
        const parseGameTime = gameUtils.__get__("parseGameTime");
        const toPeriodTime = gameUtils.__get__("toPeriodTime");
        const playEventNames = gameUtils.__get__("playEvents");
        const stoppageEventNames = gameUtils.__get__("stoppageEvents");

        it("Play is initiated by a 'Faceoff' event.", function() {
            const playEvents = samples.finishedGameData.liveData.plays.allPlays
                .filter(e => playEventNames.indexOf(e.result.event) >= 0);

            const result = parseGameTime(samples.finishedGameData);
    
            assert.strictEqual(result.length, playEvents.length);
            for (var i = 0; i < result.length; i++) {
                assert.strictEqual(result[i].s, toPeriodTime(playEvents[i].about.periodTime));
                assert.strictEqual(result[i].p, playEvents[i].about.period);
            }
        });

        it("Play start timestamp is adjusted based on play end timestamp.", function() {
            const result = parseGameTime(samples.finishedGameData);
    
            for (var play of result) {
                var elapsed = play.e - play.s;
                assert.strictEqual(play.st, play.et - elapsed * 1000);
            }
        });

        it("Does not parse plays beyond overtime", function() {
            const result = parseGameTime(samples.finishedGameData);
    
            assert.strictEqual(result.every(e => e.p <= 5), true);
        });

        it("Play stopped by stoppage events", function() {
            const stoppageEvents = samples.finishedGameData.liveData.plays.allPlays
                .filter(e => stoppageEventNames.indexOf(e.result.event) >= 0 && e.about.period < 5);

            const result = parseGameTime(samples.finishedGameData);
            const eventsMissingStoppage = result.filter(e => e.missingStoppage).length;
    
            assert.strictEqual(result.length, stoppageEvents.length + eventsMissingStoppage);
            var stoppageEventOffset = 0;
            for (var i = 0; i < result.length; i++) {
                if (result[i].missingStoppage) {
                    stoppageEventOffset--;
                } else {
                    assert.strictEqual(result[i].e, toPeriodTime(stoppageEvents[i + stoppageEventOffset].about.periodTime));
                    assert.strictEqual(result[i].p, stoppageEvents[i + stoppageEventOffset].about.period);
                }   
            }
        });
    });
});