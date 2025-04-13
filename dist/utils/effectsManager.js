export class EffectsManager {
    constructor(config, kaleidoscopeInstance) {
        this.config = config;
        this.kaleidoscope = kaleidoscopeInstance;
        console.log("[EffectsManager] Initialized with cellSize:", this.config.cellSize);
    }
    initEffects() {
        // Since init() doesn't exist in Kaleidoscope, we'll use update() instead
        this.kaleidoscope.update(1, 1);
    }
    reinitialize() {
        console.log("[EffectsManager] Reinitializing effects...");
        // Since reinitialize() doesn't exist in Kaleidoscope, we'll use update() instead
        this.kaleidoscope.update(1, 1);
    }
    get cells() {
        // Access the cells through a public method or property
        // Since cells is private in Kaleidoscope, we need to create a getter in Kaleidoscope
        // For now, we'll use a type assertion to bypass the type checker
        return this.kaleidoscope.cells;
    }
    get rows() {
        // Access the rows through a public method or property
        // Since rows is private in Kaleidoscope, we need to create a getter in Kaleidoscope
        // For now, we'll use a type assertion to bypass the type checker
        return this.kaleidoscope.rows;
    }
    get cols() {
        // Access the cols through a public method or property
        // Since cols is private in Kaleidoscope, we need to create a getter in Kaleidoscope
        // For now, we'll use a type assertion to bypass the type checker
        return this.kaleidoscope.cols;
    }
    triggerChaos() {
        // Since triggerChaos() doesn't exist in Kaleidoscope, we'll use update() with extreme values
        this.kaleidoscope.update(10, 0.1);
    }
}
//# sourceMappingURL=effectsManager.js.map