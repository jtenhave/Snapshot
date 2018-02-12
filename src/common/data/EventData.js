/**
 * Class that represents event data from the NHL API.
 */
class EventData {
    
    constructor() {
        this.times = [];
    }

    /**
     * Adds a an event time.
     */
    addTime(time) {
        this.times.push(time);
    }

    /**
     * Gets the number of event occurrences up to a given time.
     */
    getCount(time) {
        return this.times.filter(t => t <= time).length;
    }

    /**
     * Returns a minified JSON object.
     */
    toJSON() {
        return this.times.slice();
    }

    /**
     * Creates an EventData from a minified JSON object.
     */
    static fromJSON(json) {
        const eventData = new EventData();
        eventData.times = json.slice();

        return eventData;
    }
}
    
if (typeof module !== "undefined" && module.exports) {
    module.exports = EventData;
}
