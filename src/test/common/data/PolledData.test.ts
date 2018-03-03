import "mocha";
import * as assert from "assert";
import { PolledData } from "../../../common/data/PolledData";

describe('PolledData', function() {
  describe('constructor()', function() {
    it("Initializes PolledData", function() {
        const data = new PolledData();

        assert.strictEqual(data.times.length, 0);
        assert.strictEqual(data.values.length, 0);
    });
  });

  describe('addValue()', function() {
    it("Adds value", function() {
        const data = new PolledData();
        data.addValue(1234, 4321);

        assert.strictEqual(data.times.length, 1);
        assert.strictEqual(data.values.length, 1);
        assert.strictEqual(data.times[0], 1234);
        assert.strictEqual(data.values[0], 4321);
    });

    it("Does not add undefined value", function() {
        const data = new PolledData();
        data.addValue(1234, undefined);

        assert.strictEqual(data.times.length, 0);
        assert.strictEqual(data.values.length, 0);
    });

    it("Does not add value if less then last value", function() {
        const data = new PolledData();
        data.addValue(1234, 4321);
        data.addValue(2000, 4320);

        assert.strictEqual(data.times.length, 1);
        assert.strictEqual(data.values.length, 1);
        assert.strictEqual(data.times[0], 1234);
        assert.strictEqual(data.values[0], 4321);
    });

    it("Does not add value if same as last value", function() {
        const data = new PolledData();
        data.addValue(1234, 4321);
        data.addValue(2000, 4321);

        assert.strictEqual(data.times.length, 1);
        assert.strictEqual(data.values.length, 1);
        assert.strictEqual(data.times[0], 1234);
        assert.strictEqual(data.values[0], 4321);
    });
  });

  describe('getValue()', function() {
    it("Returns zero for time less than all", function() {
        const data = new PolledData();
        data.addValue(2, 3);
        data.addValue(4, 5);
        data.addValue(6, 7);
        data.addValue(8, 7);

        assert.strictEqual(data.getValue(1), 0);
    });

    it("Returns correct value for time less than some", function() {
        const data = new PolledData();
        data.addValue(2, 3);
        data.addValue(4, 5);
        data.addValue(6, 7);
        data.addValue(8, 7);

        assert.strictEqual(data.getValue(5), 5);
    });

    it("Returns correct value for time less than or equal to some", function() {
        const data = new PolledData();
        data.addValue(2, 3);
        data.addValue(4, 5);
        data.addValue(6, 7);
        data.addValue(8, 7);

        assert.strictEqual(data.getValue(6), 7);
    });

    it("Returns correct value for time less than or equal to some", function() {
        const data = new PolledData();
        data.addValue(2, 3);
        data.addValue(4, 5);
        data.addValue(6, 7);
        data.addValue(8, 7);

        assert.strictEqual(data.getValue(6), 7);
    });

    it("Returns correct value for time greater than all", function() {
        const data = new PolledData();
        data.addValue(2, 3);
        data.addValue(4, 5);
        data.addValue(6, 7);
        data.addValue(8, 7);
        data.addValue(10, 9);

        assert.strictEqual(data.getValue(12), 9);
    });
  });

  describe('toJSON()', function() {
    it("Returns correct JSON", function() {
        const data = new PolledData();
        data.addValue(1234, 4321);

        const json = data.toJSON();

        assert.strictEqual(json.t.length, 1);
        assert.strictEqual(json.v.length, 1);
        assert.strictEqual(json.t[0], 1234);
        assert.strictEqual(json.v[0], 4321);
    });
  });

  describe('fromJSON()', function() {
    it("Returns correct PolledData", function() {
        const json = {
            t: [1234],
            v: [4321]
        };
        
        const data = PolledData.fromJSON(json);

        assert.strictEqual(data.times.length, 1);
        assert.strictEqual(data.values.length, 1);
        assert.strictEqual(data.times[0], 1234);
        assert.strictEqual(data.values[0], 4321);
    });
  });
});