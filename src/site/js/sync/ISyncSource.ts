
/**
 * Represents a source used to sync Snapshot with a game playback.
 */
export interface ISyncSource {

    /**
     * Sets up the sync source.
     */
    connect(): Promise<void>;

    /**
     * Registers a callback to receive time notifications.
     */
    register(callback: (time: number) => void);
}
