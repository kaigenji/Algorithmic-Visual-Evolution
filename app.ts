// File: app.ts
import { config, Config } from './config.js';
import { GridManager } from './utils/gridManager.js';
import { TickManager } from './utils/tickManager.js';
import { setupKeyControls } from './utils/keys.js';
import { Kaleidoscope } from './algorithms/kaleidoscope.js';
import { EquilibriumManager } from './utils/equilibriumManager.js';
import { setupUI, parameterSliders, PARAM_DEFINITIONS } from './utils/uiManager.js';
import { setupMacrosUI, macros } from './utils/macrosUI.js';
import { getDerivedColors } from './utils/colorTheory.js';
import { Cell } from './types.js';

let gm: GridManager;
let kaleidoscope: Kaleidoscope;
const equilibriumManager = new EquilibriumManager();
const tickManager = new TickManager();

function createSimulation(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = config.canvasWidth;
  canvas.height = config.canvasHeight;

  const rows = Math.floor(config.canvasHeight / config.cellSize);
  const cols = Math.floor(config.canvasWidth / config.cellSize);

  gm = new GridManager(rows, cols);
  kaleidoscope = new Kaleidoscope(
    Math.floor(rows / 4),
    Math.floor(cols / 4),
    gm.getCells(),
    rows,
    cols,
    gm.bounceCoordinates.bind(gm)
  );
}

function updateDerivedColors(): void {
  const cs = config.colorSettings;
  config.derivedColors = getDerivedColors(cs.baseH, cs.baseS, cs.baseB, cs.scheme);
}

interface MacroTarget {
  path: string;
  influence?: number;
  baseline?: number;
}

interface Macro {
  enabled: boolean;
  getModulation: (t: number) => number;
  targets: MacroTarget[];
}

function applyMacros(): void {
  const t = tickManager.cycleCount || 0;
  macros.forEach((macro: Macro) => {
    if (!macro.enabled) return;
    let rawWave = macro.getModulation(t);
    let normWave = (rawWave + 1) / 2; // normalized to [0,1]
    macro.targets.forEach(tgt => {
      if (config._overrides[tgt.path]) return;
      let currentVal = getConfigValueByPath(tgt.path);
      if (tgt.baseline === undefined) {
        tgt.baseline = currentVal;
      }
      const def = PARAM_DEFINITIONS.find(d => d.path === tgt.path);
      if (!def || def.max === undefined || def.min === undefined) return;
      const range = def.max - def.min;
      const influence = tgt.influence || 1;
      // Interpolate linearly: blend between baseline and full modulation
      let targetVal = def.min + normWave * range;
      let newVal = (1 - influence) * currentVal + influence * targetVal;
      newVal = Math.max(def.min, Math.min(def.max, newVal));
      newVal = Math.round(newVal * 100) / 100;
      setConfigValueByPath(tgt.path, newVal);
    });
  });
  config._overrides = {};
}

function getConfigValueByPath(pathStr: string): any {
  const parts = pathStr.split(".");
  let current: any = config;
  for (const p of parts) {
    current = current[p];
  }
  return current;
}

function setConfigValueByPath(pathStr: string, newValue: any): void {
  const parts = pathStr.split(".");
  let current: any = config;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = newValue;
}

function updateParameterSliders(): void {
  for (const path in parameterSliders) {
    const { slider, valueDisplay } = parameterSliders[path];
    const currentVal = getConfigValueByPath(path);
    slider.value = currentVal;
    valueDisplay.textContent = (Math.round(currentVal * 100) / 100).toString();
  }
}

function render(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cells = gm.getCells();
  const rows = gm.getRows();
  const cols = gm.getCols();
  const cellSize = config.cellSize;
  const binaryOn = config.binaryTransitions.enabled;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = cells[i][j];
      if (cell.state === 1 && cell.color) {
        let alphaToRender = cell.color.a;
        if (binaryOn) alphaToRender = 1.0;
        ctx.fillStyle = `rgba(${cell.color.r}, ${cell.color.g}, ${cell.color.b}, ${alphaToRender})`;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }
  updateParameterSliders();
}

function onTick(): void {
  updateDerivedColors();
  applyMacros();

  let activeCellsCount = 0;
  const cells = gm.getCells();
  const rows = gm.getRows();
  const cols = gm.getCols();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = cells[i][j];
      if (cell.state === 1 && cell.color && cell.color.a > 0) activeCellsCount++;
    }
  }
  const coverageFraction = (activeCellsCount / (gm.getRows() * gm.getCols())) || 0;
  equilibriumManager.update(coverageFraction);

  const { growthMultiplier, decayMultiplier } = {
    growthMultiplier: equilibriumManager.getGrowthMultiplier(),
    decayMultiplier: equilibriumManager.getDecayMultiplier()
  };
  kaleidoscope.update(growthMultiplier, decayMultiplier);
  render();
}

declare global {
  interface Window {
    updateConfig: (path: string, val: any) => void;
  }
}

function updateConfig(path: string, val: any): void {
  console.log(`[Config Updated] ${path} = ${val}`);
  if (path === "tickRate") {
    tickManager.stop();
    tickManager.start();
  } else if (path === "cellSize") {
    createSimulation();
  }
  // Update the config object
  const parts = path.split('.');
  let current: any = config;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = val;
}

setupUI(updateConfig);
setupMacrosUI((macro: Macro | null) => {
  // Optionally integrate with key controls.
});
createSimulation();
tickManager.onTick(onTick);
tickManager.start();
setupKeyControls(config, () => {}, console.log);

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    e.preventDefault();
    const paramPanel = document.getElementById('parametersPanel');
    const macrosPanel = document.getElementById('macrosPanel');
    if (paramPanel && macrosPanel) {
      paramPanel.style.display = (paramPanel.style.display === 'none') ? 'block' : 'none';
      macrosPanel.style.display = (macrosPanel.style.display === 'none') ? 'block' : 'none';
    }
  }
});

// Assign the updateConfig function to the window object
window.updateConfig = updateConfig; 