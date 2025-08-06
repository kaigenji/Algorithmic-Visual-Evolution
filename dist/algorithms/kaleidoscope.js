/**
 * Algorithmic Visual Evolution - Kaleidoscope Algorithm
 *
 * Implements a cellular automaton that creates kaleidoscope-like symmetric patterns:
 * - Manages cell growth and decay through quadrant mirroring
 * - Handles cell state transitions and color interpolation
 * - Creates balanced, symmetric visual patterns that evolve over time
 * - Responds to equilibrium parameters to maintain target cell density
 */
import { CreepingFig } from './creepingFig.js';
export class Kaleidoscope {
    constructor(initialRow, initialCol, fullCells, rows, cols, gridManager) {
        this.cells = fullCells;
        this.rows = rows;
        this.cols = cols;
        this.gridManager = gridManager;
        this.bounceFn = gridManager.bounceCoordinates.bind(gridManager);
        // Base quadrant is top-left quarter
        this.baseRows = Math.floor(rows / 2);
        this.baseCols = Math.floor(cols / 2);
        // Create a sub-grid for the creeping fig using the GridManager
        this.baseCells = this.gridManager.createSubGrid(this.baseRows, this.baseCols, { r: 128, g: 0, b: 128, a: 1 });
        // The single CreepingFig in that sub-grid
        const baseRow = Math.floor(this.baseRows / 2);
        const baseCol = Math.floor(this.baseCols / 2);
        this.creepingFig = new CreepingFig(baseRow, baseCol, this.baseCells, this.baseRows, this.baseCols, this.bounceBaseCoordinates.bind(this), this.gridManager);
    }
    update(growthMultiplier, decayMultiplier) {
        // Update base creeper
        this.creepingFig.update(growthMultiplier);
        this.creepingFig.updateDecay(decayMultiplier);
        // Mirror the base quadrant to the full grid
        this.reflectBaseQuadrant();
    }
    reflectBaseQuadrant() {
        for (let i = 0; i < this.baseRows; i++) {
            for (let j = 0; j < this.baseCols; j++) {
                const src = this.baseCells[i][j];
                // Copy to all four quadrants using GridManager
                this.gridManager.copyCell(this.cells, i, j, src);
                this.gridManager.copyCell(this.cells, i, j + this.baseCols, this.baseCells[i][this.baseCols - j - 1]);
                this.gridManager.copyCell(this.cells, i + this.baseRows, j, this.baseCells[this.baseRows - i - 1][j]);
                this.gridManager.copyCell(this.cells, i + this.baseRows, j + this.baseCols, this.baseCells[this.baseRows - i - 1][this.baseCols - j - 1]);
            }
        }
    }
    bounceBaseCoordinates(i, j, direction) {
        const newI = Math.max(0, Math.min(i, this.baseRows - 1));
        const newJ = Math.max(0, Math.min(j, this.baseCols - 1));
        return { newI, newJ };
    }
}
//# sourceMappingURL=kaleidoscope.js.map