/**
 * macros.js
 *
 * Defines a Macro class for modulating parameters via LFO.
 * Each macro holds multiple parameter targets.
 */
export class Macro {
  constructor() {
    // Each target: { path: string, influence: number, baseline?: number }
    this.targets = [];
    // Global macro settings:
    this.useCurrentBaseline = false; // default off
    this.currentBaseline = 0.5;
    this.trigFunc = "sin";
    this.periodMultiplier = 1.0;
    this.lfoPeriod = 100; // ticks
    this.dampener = 0.5;
    // On/off toggle for macro
    this.enabled = true;
  }

  setBaseline(value) {
    this.currentBaseline = value;
  }

  getModulation(tick) {
    // Apply periodMultiplier: adjust the tick count
    const adjustedTick = tick * this.periodMultiplier;
    const phase = (adjustedTick % this.lfoPeriod) / this.lfoPeriod;
    let wave;
    switch (this.trigFunc) {
      case "sin":
        wave = Math.sin(phase * 2 * Math.PI);
        break;
      case "cos":
        wave = Math.cos(phase * 2 * Math.PI);
        break;
      case "tan":
        wave = Math.tan(phase * 2 * Math.PI);
        break;
      case "csc":
        wave = 1 / Math.sin(phase * 2 * Math.PI);
        break;
      case "sec":
        wave = 1 / Math.cos(phase * 2 * Math.PI);
        break;
      case "cot":
        wave = 1 / Math.tan(phase * 2 * Math.PI);
        break;
      default:
        wave = Math.sin(phase * 2 * Math.PI);
    }
    return wave * this.dampener;
  }
}
