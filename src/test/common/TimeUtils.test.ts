import * as assert from "assert";
import { TimeUtils } from "../../common/TimeUtils";

describe("TimeUtils", function() {
    describe("toSeconds()", function() {
        it("Returns correct value", function() {       
            const result = TimeUtils.toPeriodTime("24:32");

            assert.strictEqual(result, 1472);
        });
    });
    
    describe("toPeriodTime()", function() {
        it("Returns correct value for normal period time", function() {       
            const result = TimeUtils.toPeriodTime("13:32");

            assert.strictEqual(result, 812);
        });

        it("Returns correct value for reverse period time", function() {       
            const result = TimeUtils.toPeriodTime("13:32", true);

            assert.strictEqual(result, 388);
        });

        it("Returns correct value for reverse ot period time", function() {       
            const result = TimeUtils.toPeriodTime("3:32", true, true);

            assert.strictEqual(result, 60 + 28);
        });
    });

    describe("toTotalTime()", function() {
        it("Returns correct value for normal period time", function() {       
            const result = TimeUtils.toTotalTime("13:32", 1);

            assert.strictEqual(result, 2012);
        });

        it("Returns correct value for reverse period time", function() {       
            const result = TimeUtils.toTotalTime("13:32", 1, true);

            assert.strictEqual(result, 1588);
        });

        it("Returns correct value for reverse ot period time", function() {       
            const result = TimeUtils.toTotalTime("3:32", 3, true, true);

            assert.strictEqual(result, 3688);
        });
    });
});