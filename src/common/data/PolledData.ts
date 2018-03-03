/**
 * Class that represents event data from the NHL API.
 */
export class PolledData {
    
    /**
     * Polling times.
     */
    times: number[] = [];

    /**
     * Values polled.
     */
    values: number[] = [];

    /**
     * Adds a value with a given time.
     */
    addValue(time: number, value: number): void {
        const count = this.values.length;
        if (value == undefined || (count && this.values[count - 1] >= value)) {
            return;
        }

        this.times.push(time);
        this.values.push(value);
    }

    /**
     * Gets the value up to a given time.
     */
    getValue(time: number): number {
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
    toJSON(): any {
        return {
            t: this.times,
            v: this.values
        }
    }

    /**
     * Creates an PolledData from a minified JSON object.
     */
    static fromJSON(json: any): PolledData {
        const polledData = new PolledData();
        polledData.times = json.t;
        polledData.values = json.v;

        return polledData;
    }
}
    