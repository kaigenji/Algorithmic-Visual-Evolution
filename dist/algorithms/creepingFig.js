import { config } from '../config.js';
function hsbToRgb(h, s, b) {
    s /= 100;
    b /= 100;
    const c = b * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = b - c;
    let r1, g1, b1;
    if (h < 60) {
        r1 = c;
        g1 = x;
        b1 = 0;
    }
    else if (h < 120) {
        r1 = x;
        g1 = c;
        b1 = 0;
    }
    else if (h < 180) {
        r1 = 0;
        g1 = c;
        b1 = x;
    }
    else if (h < 240) {
        r1 = 0;
        g1 = x;
        b1 = c;
    }
    else if (h < 300) {
        r1 = x;
        g1 = 0;
        b1 = c;
    }
    else {
        r1 = c;
        g1 = 0;
        b1 = x;
    }
    return {
        r: Math.round((r1 + m) * 255),
        g: Math.round((g1 + m) * 255),
        b: Math.round((b1 + m) * 255),
        a: 1
    };
}
export class CreepingFig {
    constructor(initialRow, initialCol, cells, rows, cols, bounceFn) {
        this.cells = cells;
        this.rows = rows;
        this.cols = cols;
        this.bounceFn = bounceFn;
        this.activeCells = [];
        this.activateCell(initialRow, initialCol, undefined);
        this.activeCells.push({ i: initialRow, j: initialCol });
        this.neighborOffsets = [];
        this.totalCells = rows * cols;
        this.cycle = 0;
    }
    buildNeighborOffsets(radius) {
        const offsets = [];
        for (let di = -radius; di <= radius; di++) {
            for (let dj = -radius; dj <= radius; dj++) {
                if (di === 0 && dj === 0)
                    continue;
                offsets.push({ di, dj });
            }
        }
        return offsets;
    }
    update(growthMultiplier) {
        const figCfg = config.creepingFig;
        const baseActivations = figCfg.baseActivations;
        const neighborRadius = figCfg.neighborRadius;
        const branchAge = figCfg.branchAge;
        const directionFollowChance = figCfg.directionFollowChance;
        if (!this.neighborOffsets.length ||
            Math.abs(this.neighborOffsets[0].di) > neighborRadius) {
            this.neighborOffsets = this.buildNeighborOffsets(neighborRadius);
        }
        this.cycle++;
        this.pruneInactive();
        if (this.activeCells.length === 0)
            return;
        let expansions = Math.floor(baseActivations * growthMultiplier);
        expansions = Math.max(expansions, 1);
        for (let a = 0; a < expansions; a++) {
            if (this.activeCells.length === 0)
                break;
            const index = Math.floor(Math.random() * this.activeCells.length);
            const { i, j } = this.activeCells[index];
            const cell = this.cells[i][j];
            if (!cell)
                continue;
            const age = this.cycle - (cell.birth || 0);
            if (age < branchAge)
                continue;
            let chosenOffset;
            if (Math.random() < 0.2) {
                chosenOffset = this.neighborOffsets[Math.floor(Math.random() * this.neighborOffsets.length)];
            }
            else if (cell.prevDir && Math.random() < directionFollowChance) {
                chosenOffset = cell.prevDir;
            }
            else {
                chosenOffset = this.neighborOffsets[Math.floor(Math.random() * this.neighborOffsets.length)];
            }
            let newI = i + chosenOffset.di;
            let newJ = j + chosenOffset.dj;
            if (newI < 0 || newI >= this.rows || newJ < 0 || newJ >= this.cols) {
                const result = this.bounceFn(newI, newJ, chosenOffset);
                if (result) {
                    newI = result.newI;
                    newJ = result.newJ;
                }
            }
            if (!this.cells[newI] || !this.cells[newI][newJ])
                continue;
            if (this.cells[newI][newJ].state === 0) {
                this.activateCell(newI, newJ, chosenOffset);
                this.activeCells.push({ i: newI, j: newJ });
            }
        }
    }
    updateDecay(decayMultiplier) {
        const dCfg = config.decay;
        const baseDecayChance = dCfg.baseDecayChance;
        const decaySlowdownFactor = dCfg.slowdownFactor;
        const minDecayChance = dCfg.minDecayChance;
        const edgeBreakChance = dCfg.edgeBreakChance;
        const binaryOn = config.binaryTransitions.enabled;
        const threshold = config.binaryTransitions.threshold;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const c = this.cells[i][j];
                if (!c)
                    continue;
                if (c.state === 1) {
                    const age = this.cycle - (c.birth || 0);
                    let decayChance = baseDecayChance / (1 + age * decaySlowdownFactor);
                    decayChance = Math.max(decayChance, minDecayChance);
                    const isEdge = i === 0 || j === 0 ||
                        i === this.rows - 1 || j === this.cols - 1 ||
                        (this.cells[i - 1] && this.cells[i - 1][j] && this.cells[i - 1][j].state === 0) ||
                        (this.cells[i + 1] && this.cells[i + 1][j] && this.cells[i + 1][j].state === 0) ||
                        (this.cells[i] && this.cells[i][j - 1] && this.cells[i][j - 1].state === 0) ||
                        (this.cells[i] && this.cells[i][j + 1] && this.cells[i][j + 1].state === 0);
                    if (isEdge && Math.random() < edgeBreakChance * decayMultiplier) {
                        if (c.color) {
                            c.color.a -= 0.1;
                        }
                    }
                    else if (Math.random() < decayChance * decayMultiplier) {
                        if (c.color) {
                            c.color.a -= 0.015;
                        }
                    }
                    if (binaryOn) {
                        if (c.color && c.color.a < threshold) {
                            c.state = 0;
                        }
                    }
                    else {
                        if (c.color && c.color.a < 0.01) {
                            c.state = 0;
                        }
                    }
                }
            }
        }
    }
    pruneInactive() {
        this.activeCells = this.activeCells.filter(({ i, j }) => {
            const c = this.cells[i][j];
            return c && c.state === 1;
        });
        if (this.activeCells.length === 0) {
            const i = Math.floor(Math.random() * this.rows);
            const j = Math.floor(Math.random() * this.cols);
            this.activateCell(i, j, undefined);
            this.activeCells.push({ i, j });
        }
    }
    activateCell(i, j, dir) {
        const dCfg = config.decay;
        const c = this.cells[i][j];
        if (!c)
            return;
        c.state = 1;
        if (!c.color) {
            c.color = { r: 0, g: 0, b: 0, a: 1 };
        }
        const derived = config.derivedColors;
        if (derived && derived.length > 0) {
            const idx = Math.floor(Math.random() * derived.length);
            const hsb = derived[idx];
            c.color = hsbToRgb(hsb.h, hsb.s, hsb.b);
        }
        else {
            c.color = { r: 255, g: 0, b: 0, a: 1 };
        }
        c.decaying = false;
        c.birth = this.cycle;
        c.prevDir = dir;
        c.decayDelay = dCfg.baseDelay + Math.floor(Math.random() * dCfg.randomRange);
    }
}
//# sourceMappingURL=creepingFig.js.map