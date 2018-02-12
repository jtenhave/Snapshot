/**
 * Class that represents event data from the NHL API.
 */
class PolledData {

    constructor() {
        this.times = [];
        this.values = [];
    }

    /**
     * Adds a value with a given time.
     */
    addValue(time, value) {
        const count = this.values.length;
        if (count && this.values[count - 1] === value) {
            return;
        }

        this.times.push(time);
        this.values.push(value);
    }

    /**
     * Gets the value up to a given time.
     */
    getValue(time) {
        for (let i = this.times.length - 1; i >= 0; i--) {
            if (this.times[i] <= time) {
                return this.values[i];
            }
        }

        return 0;
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON() {
        return {
            t: this.times,
            v: this.values
        }
    }

    /**
     * Creates an PolledData from a minified JSON object.
     */
    static fromJSON(json) {
        const polledData = new PolledData();
        polledData.times = json.t;
        polledData.values = json.v;

        return polledData;
    }
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = PolledData;
}
