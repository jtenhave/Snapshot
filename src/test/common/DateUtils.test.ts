import "mocha";
import * as assert from "assert";
import { DateUtils } from "../../common/DateUtils";
import { expect } from "chai";

describe('DateUtils', function() {
  describe('formatShortDate()', function() {
    it("Should properly format a date as yyyy-MM-dd", function() {
        const date = new Date(2017, 4, 9);
        
        const result = DateUtils.formatShortDate(date);

        assert.strictEqual(result, "2017-05-09");
    });
  });
});