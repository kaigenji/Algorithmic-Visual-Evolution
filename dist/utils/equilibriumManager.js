// File: utils/equilibriumManager.ts
import { config } from '../config.js';
export class EquilibriumManager {
    constructor() {
        this.growthMultiplier = 1;
        this.decayMultiplier = 1;
        const eqCfg = config.equilibrium;
        this.targetFraction = config.activeCellDensity;
        this.maxExpansionScale = eqCfg.maxExpansionScale;
        this.maxDecayScale = eqCfg.maxDecayScale;
        this.minExpansionScale = eqCfg.minExpansionScale;
        this.minDecayScale = eqCfg.minDecayScale;
        this.expansionResponse = eqCfg.expansionResponse;
        this.decayResponse = eqCfg.decayResponse;
    }
    update(currentCoverage) {
        this.targetFraction = config.activeCellDensity;
        const difference = this.targetFraction - currentCoverage;
        let relativeDiff = Math.log1p(Math.abs(difference));
        if (difference > 0) {
            this.growthMultiplier = 1 + (relativeDiff * this.maxExpansionScale * this.expansionResponse);
            this.decayMultiplier = Math.max(1 - (relativeDiff * this.decayResponse), this.minDecayScale);
        }
        else {
            this.growthMultiplier = Math.max(1 - (relativeDiff * this.expansionResponse), this.minExpansionScale);
            this.decayMultiplier = 1 + (relativeDiff * this.maxDecayScale * this.decayResponse);
        }
        this.growthMultiplier = (this.growthMultiplier + 1) / 2;
        this.decayMultiplier = (this.decayMultiplier + 1) / 2;
    }
    // Public getters
    getGrowthMultiplier() {
        return this.growthMultiplier;
    }
    getDecayMultiplier() {
        return this.decayMultiplier;
    }
}
//# sourceMappingURL=equilibriumManager.js.map