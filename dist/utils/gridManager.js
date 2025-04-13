export class GridManager {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        for (let i = 0; i < rows; i++) {
            this.cells[i] = [];
            for (let j = 0; j < cols; j++) {
                this.cells[i][j] = {
                    state: 0,
                    color: { r: 0, g: 0, b: 0, a: 1 },
                    decaying: false,
                    birth: 0,
                    decayDelay: 0
                };
            }
        }
    }
    // Bounce: clamp i,j to grid boundaries. Return the new coords + direction if needed.
    bounceCoordinates(i, j, direction) {
        const newI = Math.max(0, Math.min(i, this.rows - 1));
        const newJ = Math.max(0, Math.min(j, this.cols - 1));
        let newDirection = { di: direction.di, dj: direction.dj };
        if (i < 0 || i >= this.rows)
            newDirection.di = -direction.di;
        if (j < 0 || j >= this.cols)
            newDirection.dj = -direction.dj;
        return { newI, newJ, newDirection };
    }
    // Public getters
    getCells() {
        return this.cells;
    }
    getRows() {
        return this.rows;
    }
    getCols() {
        return this.cols;
    }
}
//# sourceMappingURL=gridManager.js.map