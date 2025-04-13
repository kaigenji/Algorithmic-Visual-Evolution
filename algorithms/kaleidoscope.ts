import { CreepingFig } from './creepingFig';
import { Cell, BounceFunction, RGB } from '../types';

export class Kaleidoscope {
  private cells: Cell[][];
  private rows: number;
  private cols: number;
  private bounceFn: BounceFunction;
  private baseRows: number;
  private baseCols: number;
  private baseCells: Cell[][];
  private creepingFig: CreepingFig;

  constructor(
    initialRow: number,
    initialCol: number,
    fullCells: Cell[][],
    rows: number,
    cols: number,
    bounceFn: BounceFunction
  ) {
    this.cells = fullCells;
    this.rows = rows;
    this.cols = cols;
    this.bounceFn = bounceFn;

    // Base quadrant is top-left quarter
    this.baseRows = Math.floor(rows / 2);
    this.baseCols = Math.floor(cols / 2);

    // Create a sub-grid for the creeping fig
    this.baseCells = [];
    for (let i = 0; i < this.baseRows; i++) {
      this.baseCells[i] = [];
      for (let j = 0; j < this.baseCols; j++) {
        this.baseCells[i][j] = {
          state: 0,
          color: { r: 128, g: 0, b: 128, a: 1 } as RGB,
          decaying: false,
          birth: 0,
          decayDelay: 0
        };
      }
    }

    // The single CreepingFig in that sub-grid
    const baseRow = Math.floor(this.baseRows / 2);
    const baseCol = Math.floor(this.baseCols / 2);
    this.creepingFig = new CreepingFig(
      baseRow,
      baseCol,
      this.baseCells,
      this.baseRows,
      this.baseCols,
      this.bounceBaseCoordinates.bind(this)
    );
  }

  update(growthMultiplier: number, decayMultiplier: number): void {
    // Update base creeper
    this.creepingFig.update(growthMultiplier);
    this.creepingFig.updateDecay(decayMultiplier);

    // Mirror the base quadrant to the full grid
    this.reflectBaseQuadrant();
  }

  private reflectBaseQuadrant(): void {
    for (let i = 0; i < this.baseRows; i++) {
      for (let j = 0; j < this.baseCols; j++) {
        const src = this.baseCells[i][j];
        this.copyCell(i, j, src);
        this.copyCell(i, j + this.baseCols, this.baseCells[i][this.baseCols - j - 1]);
        this.copyCell(
          i + this.baseRows,
          j,
          this.baseCells[this.baseRows - i - 1][j]
        );
        this.copyCell(
          i + this.baseRows,
          j + this.baseCols,
          this.baseCells[this.baseRows - i - 1][this.baseCols - j - 1]
        );
      }
    }
  }

  private copyCell(targetRow: number, targetCol: number, sourceCell: Cell): void {
    const row = Math.max(0, Math.min(targetRow, this.rows - 1));
    const col = Math.max(0, Math.min(targetCol, this.cols - 1));
    const mainCell = this.cells[row][col];

    mainCell.state = sourceCell.state;
    if (sourceCell.color) {
      mainCell.color = { ...sourceCell.color };
    }
    mainCell.decaying = sourceCell.decaying;
    mainCell.birth = sourceCell.birth;
    mainCell.decayDelay = sourceCell.decayDelay;
  }

  private bounceBaseCoordinates(i: number, j: number, direction: { di: number; dj: number }): { newI: number; newJ: number } {
    const newI = Math.max(0, Math.min(i, this.baseRows - 1));
    const newJ = Math.max(0, Math.min(j, this.baseCols - 1));
    return { newI, newJ };
  }
} 