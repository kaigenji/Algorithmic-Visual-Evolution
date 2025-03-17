// File: utils/effectsManager.js
export class EffectsManager {
  constructor(config, kaleidoscopeInstance) {
    this.config = config;
    this.kaleidoscope = kaleidoscopeInstance;
    console.log("[EffectsManager] Initialized with cellSize:", this.config.cellSize);
  }
  
  initEffects() {
    this.kaleidoscope.init();
  }
  
  reinitialize() {
    console.log("[EffectsManager] Reinitializing effects...");
    this.kaleidoscope.reinitialize();
  }
  
  get cells() {
    return this.kaleidoscope.cells;
  }
  
  get rows() {
    return this.kaleidoscope.rows;
  }
  
  get cols() {
    return this.kaleidoscope.cols;
  }
  
  triggerChaos() {
    this.kaleidoscope.triggerChaos();
  }
}
