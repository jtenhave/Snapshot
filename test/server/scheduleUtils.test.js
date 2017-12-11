var assert = require("assert");
var rewire = require("rewire");
var samples = require ("../samples/scheduleData");

var scheduleUtils = rewire("../../src/server/scheduleUtils.js");

describe('scheduleUtils', function() {
  describe('parseScheduleData()', function() {
    const parseScheduleData = scheduleUtils.__get__("parseScheduleData");
    it("Returns empty if no games scheduled.", function() {
        const result = parseScheduleData(samples.noGames);

        assert.strictEqual(result.length, 0);
    });

    it("Parses schedule data correctly.", function() {
        const expectedGames = samples.multiGames.dates[0].games;
        
        const result = parseScheduleData(samples.multiGames);
        
        assert.strictEqual(result.length, expectedGames.length);
        assert.strictEqual(result[0]._id, expectedGames[0].gamePk.toString());
        assert.strictEqual(result[0].date.getTime(), new Date(expectedGames[0].gameDate).getTime());
        assert.strictEqual(result[0].playoffs, false);
        assert.strictEqual(result[1]._id, expectedGames[1].gamePk.toString());
        assert.strictEqual(result[1].date.getTime(), new Date(expectedGames[1].gameDate).getTime());
        assert.strictEqual(result[1].playoffs, false);
    });

    // TODO Add tests for playoffs.
  });
});