var assert = require("assert");
var rewire = require("rewire");
var samples = require ("../samples/scheduleData");

var scheduleUtils = rewire("../../src/server/scheduleUtils.js");

describe('scheduleUtils', function() {
  describe('parseScheduleData()', function() {
    const parseScheduleData = scheduleUtils.__get__("parseScheduleData");
    it("Returns empty if raw game data does not have any dates.", function() {
        const result = parseScheduleData(samples.noGames);

        assert.strictEqual(result.length, 0);
    });

    it("Returns correct parsed game data.", function() {
        const expectedGames = samples.multiGames.dates[0].games;
        
        const result = parseScheduleData(samples.multiGames);
        
        assert.strictEqual(result.length, expectedGames.length);
        assert.strictEqual(result[0].id, expectedGames[0].gamePk.toString());
        assert.strictEqual(result[0].date.getTime(), new Date(expectedGames[0].gameDate).getTime());
        assert.strictEqual(result[0].playoffs, false);
        assert.strictEqual(result[1].id, expectedGames[1].gamePk.toString());
        assert.strictEqual(result[1].date.getTime(), new Date(expectedGames[1].gameDate).getTime());
        assert.strictEqual(result[1].playoffs, false);
    });

    // TODO Add tests for playoffs.
  });
});