
/**
 * Contains a web socket that wraps PVR multicast broadcast.
 */
class PVRWebSocket {

    constructor(address) {
        this.address = address;
    }

    /**
     * Attempt to connect to the web socket.
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(`ws://${this.address}`, "pvr-sync");
                ws.addEventListener("open", event => {
                    resolve();
                });
        
                ws.addEventListener("message", event => {
                    if (this.callback) {
                        callback(parseInt(event.data))
                    }
                });

                ws.onerror = e => {
                    reject(new Error("Failed to connect to web socket"));
                };
            } catch (e) {
               reject(e);
            }
        });
    }

    /** 
     * Register for web socket events.
     */
    register (callback) {
        this.callback = callback;
    }
}
