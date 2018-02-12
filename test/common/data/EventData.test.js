const assert = require("assert");
const EventData = require("../../../src/common/data/EventData");

describe('EventData', function() {
  describe('constructor()', function() {
    it("Initializes EventData", function() {
        const data = new EventData();

        assert.strictEqual(data.times.length, 0);
    });
  });

  describe('addTime()', function() {
    it("Adds time", function() {
        const data = new EventData();
        data.addTime(1234);
        data.addTime(4321);

        assert.strictEqual(data.times.length, 2);
        assert.strictEqual(data.times[0], 1234);
        assert.strictEqual(data.times[1], 4321);
    });
  });

  describe('getCount()', function() {
    it("Returns correct count for time less than all", function() {
        const data = new EventData();
        data.addTime(2);
        data.addTime(4);
        data.addTime(6);
        data.addTime(8);

        assert.strictEqual(data.getCount(1), 0);
    });

    it("Returns correct count for time less than some", function() {
        const data = new EventData();
        data.addTime(2);
        data.addTime(4);
        data.addTime(6);
        data.addTime(8);

        assert.strictEqual(data.getCount(5), 2);
    });

    it("Returns correct count for time less than or equal to some", function() {
        const data = new EventData();
        data.addTime(2);
        data.addTime(4);
        data.addTime(6);
        data.addTime(8);

        assert.strictEqual(data.getCount(6), 3);
    });

    it("Returns correct count for time greater than all", function() {
        const data = new EventData();
        data.addTime(2);
        data.addTime(4);
        data.addTime(6);
        data.addTime(8);

        assert.strictEqual(data.getCount(10), 4);
    });
  });

  describe('toJSON()', function() {
    it("Returns correct JSON", function() {
        const data = new EventData();
        data.addTime(1234);
        data.addTime(4321);

        const json = data.toJSON();

        assert.strictEqual(json.length, 2);
        assert.strictEqual(json[0], 1234);
        assert.strictEqual(json[1], 4321);
    });
  });

  describe('fromJSON()', function() {
    it("Returns correct EventData", function() {
        const json = [1234, 4321];
        
        const data = EventData.fromJSON(json);

        assert.strictEqual(data.times.length, 2);
        assert.strictEqual(data.times[0], 1234);
        assert.strictEqual(data.times[1], 4321);
    });
  });
});