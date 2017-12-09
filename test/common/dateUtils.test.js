var assert = require("assert");
var dateUtils = require("../../src/common/dateUtils");

describe('dateUtils', function() {
  describe('formatShortDate()', function() {
    it("Should properly format a date as yyyy-MM-dd", function() {
        const date = new Date(2017, 4, 9);
        
        const result = dateUtils.formatShortDate(date);

        assert.strictEqual(result, "2017-05-09");
    });
  });
});