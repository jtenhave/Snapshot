/**
 * Class that represents event data from the NHL API.
 */
export class EventData {
    
    /**
     * Event times.
     */
    times: number[] = [];

    /**
     * Adds a an event time.
     */
    addTime(time: number): void {
        this.times.push(time);
    }

    /**
     * Gets the number of event occurrences up to a given time.
     */
    getCount(time: number): number {
        return this.times.filter(t => t <= time).length;
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON(): any {
        return this.times.slice();
    }

    /**
     * Creates an EventData from a minified JSON object.
     */
    static fromJSON(json: any): EventData {
        const eventData = new EventData();
        eventData.times = json.slice();

        return eventData;
    }
}
