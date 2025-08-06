/**
 * Algorithmic Visual Evolution - Event Bus
 *
 * Implements a lightweight event system for communication between components:
 * - Provides publish/subscribe (observer) pattern implementation
 * - Handles event registration, emission, and handling
 * - Allows decoupled communication between system components
 * - Supports typed event payloads
 * - Enables clean separation between system modules
 */
export class EventBus {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }
}
//# sourceMappingURL=eventBus.js.map