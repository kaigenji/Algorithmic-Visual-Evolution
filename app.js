import { config } from './config.js';
import { GridManager } from './utils/gridManager.js';
import { TickManager } from './utils/tickManager.js';
import { setupKeyControls } from './utils/keys.js';
import { Kaleidoscope } from './algorithms/kaleidoscope.js';
import { EquilibriumManager } from './utils/equilibriumManager.js';
import { setupUI, parameterSliders, PARAM_DEFINITIONS } from './utils/uiManager.js';
import { setupMacrosUI, macros } from './utils/macrosUI.js';
import { getDerivedColors } from './utils/colorTheory.js';

let gm, kaleidoscope;
const equilibriumManager = new EquilibriumManager();
const tickManager = new TickManager();

function createSimulation() {
  const canvas = document.getElementById('canvas');
  canvas.width = config.canvasWidth;
  canvas.height = config.canvasHeight;

  const rows = Math.floor(config.canvasHeight / config.cellSize);
  const cols = Math.floor(config.canvasWidth / config.cellSize);

  gm = new GridManager(rows, cols);
  kaleidoscope = new Kaleidoscope(
    Math.floor(rows / 4),
    Math.floor(cols / 4),
    gm.cells,
    rows,
    cols,
    gm.bounceCoordinates.bind(gm)
  );
}

function updateDerivedColors() {
  const cs = config.colorSettings;
  config.derivedColors = getDerivedColors(cs.baseH, cs.baseS, cs.baseB, cs.scheme);
}

/**
 * applyMacros() now uses a stored baseline for each target.
 * For each target, we compute a normalized wave value (0 to 1) and then interpolate between
 * the parameter's min and max based on that value and the target's influence.
 */
function applyMacros() {
  const t = tickManager.cycleCount || 0;
  macros.forEach(macro => {
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
      if (!def) return;
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

function getConfigValueByPath(pathStr) {
  const parts = pathStr.split(".");
  let current = config;
  for (const p of parts) {
    current = current[p];
  }
  return current;
}

function setConfigValueByPath(pathStr, newValue) {
  const parts = pathStr.split(".");
  let current = config;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = newValue;
}

function updateParameterSliders() {
  for (const path in parameterSliders) {
    const { slider, valueDisplay } = parameterSliders[path];
    const currentVal = getConfigValueByPath(path);
    slider.value = currentVal;
    valueDisplay.textContent = Math.round(currentVal * 100) / 100;
  }
}

function render() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const rows = gm.rows;
  const cols = gm.cols;
  const cellSize = config.cellSize;
  const binaryOn = config.binaryTransitions.enabled;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = gm.cells[i][j];
      if (cell.state === 1) {
        let alphaToRender = cell.color.a;
        if (binaryOn) alphaToRender = 1.0;
        ctx.fillStyle = `rgba(${cell.color.r}, ${cell.color.g}, ${cell.color.b}, ${alphaToRender})`;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }
  updateParameterSliders();
}

function onTick() {
  updateDerivedColors();
  applyMacros();

  let activeCellsCount = 0;
  for (let i = 0; i < gm.rows; i++) {
    for (let j = 0; j < gm.cols; j++) {
      const cell = gm.cells[i][j];
      if (cell.state === 1 && cell.color.a > 0) activeCellsCount++;
    }
  }
  const coverageFraction = (activeCellsCount / (gm.rows * gm.cols)) || 0;
  equilibriumManager.update(coverageFraction);

  const { growthMultiplier, decayMultiplier } = equilibriumManager;
  kaleidoscope.update(growthMultiplier, decayMultiplier);
  render();
}

window.updateConfig = function (path, val) {
  console.log(`[Config Updated] ${path} = ${val}`);
  if (path === "tickRate") {
    tickManager.stop();
    tickManager.start();
  } else if (path === "cellSize") {
    createSimulation();
  }
};

setupUI(updateConfig);
setupMacrosUI((macro) => {
  // Optionally integrate with key controls.
});
createSimulation();
tickManager.eventBus.on('tick', onTick);
tickManager.start();
setupKeyControls(config, () => {}, console.log);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    const paramPanel = document.getElementById('parametersPanel');
    const macrosPanel = document.getElementById('macrosPanel');
    paramPanel.style.display = (paramPanel.style.display === 'none') ? 'block' : 'none';
    macrosPanel.style.display = (macrosPanel.style.display === 'none') ? 'block' : 'none';
  }
});
