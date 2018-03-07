import { ISyncSource } from "./ISyncSource";

/**
 * Contains a web socket that wraps PVR multicast broadcast.
 */
export class PVRWebSocket implements ISyncSource {
    
    private address: string;

    private callback: (time: number) => void;

    constructor(address) {
        this.address = address;
    }

    /**
     * Attempt to connect to the web socket.
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(`ws://${this.address}`, "pvr-sync");
                ws.addEventListener("open", event => {
                    resolve();
                });
        
                ws.addEventListener("message", event => {
                    if (this.callback) {
                        this.callback(parseInt(event.data))
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
    register (callback: (time: number) => void): void {
        this.callback = callback;
    }
}   
    