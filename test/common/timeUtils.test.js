var assert = require("assert");
var timeUtils = require("../../src/common/timeUtils");

describe("timeUtils", function() {
    describe("toSeconds()", function() {
        it("Returns correct value", function() {       
            const result = timeUtils.toPeriodTime("24:32");

            assert.strictEqual(result, 1472);
        });
    });
    
    describe("toPeriodTime()", function() {
        it("Returns correct value for normal period time", function() {       
            const result = timeUtils.toPeriodTime("13:32");

            assert.strictEqual(result, 812);
        });

        it("Returns correct value for reverse period time", function() {       
            const result = timeUtils.toPeriodTime("13:32", true);

            assert.strictEqual(result, 388);
        });
    });

    describe("toTotalTime()", function() {
        it("Returns correct value for normal period time", function() {       
            const result = timeUtils.toTotalTime("13:32", 1);

            assert.strictEqual(result, 2012);
        });

        it("Returns correct value for reverse period time", function() {       
            const result = timeUtils.toTotalTime("13:32", 1, true);

            assert.strictEqual(result, 1588);
        });
    });
});