/**
 * Algorithmic Visual Evolution - Main Application
 *
 * Entry point for the application that initializes all core components:
 * - Sets up the canvas and grid system
 * - Creates and manages the simulation algorithms
 * - Handles color generation and processing
 * - Initializes UI components, parameters and macros
 * - Manages the animation loop and timing
 */
// File: app.ts
import { config } from './config.js';
import { GridManager } from './utils/gridManager.js';
import { TickManager } from './utils/tickManager.js';
import { setupKeyControls } from './utils/keys.js';
import { Kaleidoscope } from './algorithms/kaleidoscope.js';
import { EquilibriumManager } from './utils/equilibriumManager.js';
import { setupUI, parameterSliders, PARAM_DEFINITIONS } from './utils/uiManager.js';
import { setupMacrosUI, macros } from './utils/macrosUI.js';
import { getDerivedColors, rgbToCss } from './utils/colorTheory.js';
import { presetManager } from './utils/presetManager.js';
let gm;
let kaleidoscope;
const equilibriumManager = new EquilibriumManager();
const tickManager = new TickManager();
function createSimulation() {
    const canvas = document.getElementById('canvas');
    canvas.width = config.canvasWidth;
    canvas.height = config.canvasHeight;
    const rows = Math.floor(config.canvasHeight / config.cellSize);
    const cols = Math.floor(config.canvasWidth / config.cellSize);
    gm = new GridManager(rows, cols);
    kaleidoscope = new Kaleidoscope(Math.floor(rows / 4), Math.floor(cols / 4), gm.getCells(), rows, cols, gm);
}
function updateDerivedColors() {
    const cs = config.colorSettings;
    config.derivedColors = getDerivedColors(cs.baseH, cs.baseS, cs.baseB, cs.scheme);
}
function applyMacros() {
    const t = tickManager.cycleCount || 0;
    macros.forEach((macro) => {
        if (!macro.enabled)
            return;
        let rawWave = macro.getModulation(t);
        let normWave = (rawWave + 1) / 2; // normalized to [0,1]
        macro.targets.forEach(tgt => {
            if (config._overrides[tgt.path])
                return;
            let currentVal = getConfigValueByPath(tgt.path);
            if (tgt.baseline === undefined) {
                tgt.baseline = currentVal;
            }
            const def = PARAM_DEFINITIONS.find(d => d.path === tgt.path);
            if (!def || def.max === undefined || def.min === undefined)
                return;
            // Create perfect wave oscillation across full parameter range
            const targetVal = def.min + (normWave * (def.max - def.min));
            let newVal = Math.max(def.min, Math.min(def.max, targetVal));
            newVal = Math.round(newVal * 100) / 100;
            // Set the new value
            setConfigValueByPath(tgt.path, newVal);
            // Special handling for parameters that need immediate updates
            if (tgt.path === "tickRate") {
                tickManager.stop();
                tickManager.start();
            }
            else if (tgt.path === "cellSize") {
                createSimulation();
            }
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
        valueDisplay.textContent = (Math.round(currentVal * 100) / 100).toString();
    }
}
function render() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
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
                // Use modified RGB color with adjusted alpha if needed
                const displayColor = {
                    ...cell.color,
                    a: binaryOn ? 1.0 : cell.color.a
                };
                // Use the rgbToCss utility instead of manual string creation
                ctx.fillStyle = rgbToCss(displayColor);
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
    const cells = gm.getCells();
    const rows = gm.getRows();
    const cols = gm.getCols();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = cells[i][j];
            if (cell.state === 1 && cell.color && cell.color.a > 0)
                activeCellsCount++;
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
function updateConfig(path, val) {
    console.log(`[Config Updated] ${path} = ${val}`);
    if (path === "tickRate") {
        tickManager.stop();
        tickManager.start();
    }
    else if (path === "cellSize") {
        createSimulation();
    }
    // Update the config object
    const parts = path.split('.');
    let current = config;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = val;
    // Update macro baselines for this parameter
    updateMacroBaselines(path, val);
}
// Track which parameters are currently being manually adjusted
function updateMacroBaselines(path, newValue) {
    // Import macros and update baselines for matching parameters
    import('./utils/macrosUI.js').then(({ macros }) => {
        macros.forEach(macro => {
            macro.targets.forEach(target => {
                if (target.path === path) {
                    // Update the baseline to the new manual value
                    target.baseline = newValue;
                    console.log(`Updated baseline for ${path} to ${newValue}`);
                }
            });
        });
    }).catch(error => {
        console.warn('Failed to update macro baselines:', error);
    });
}
// Initialize preset system
async function initializePresets() {
    // Add a small delay to ensure server is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    await presetManager.loadPresets();
    // Always load a preset - either random or default
    let presetToLoad = null;
    if (config.RANDOM_START) {
        presetToLoad = presetManager.getRandomPreset();
        if (presetToLoad) {
            console.log(`Loading random preset: ${presetToLoad.name}`);
        }
    }
    // If no random preset or RANDOM_START is false, load the first available preset
    if (!presetToLoad) {
        const allPresets = presetManager.getPresets();
        if (allPresets.length > 0) {
            // Load the first preset (usually default)
            const firstPreset = allPresets[0];
            if (firstPreset) {
                presetToLoad = firstPreset;
                console.log(`Loading first available preset: ${firstPreset.name}`);
            }
        }
    }
    // Apply the preset if we found one
    if (presetToLoad) {
        presetManager.applyPreset(presetToLoad);
        console.log(`Applied preset: ${presetToLoad.name}`);
        // Show which preset was loaded in the UI
        const title = document.querySelector('title');
        if (title) {
            title.textContent = `Algorithmic Visual Evolution - ${presetToLoad.name}`;
        }
    }
    else {
        console.warn('No presets available, using default config');
    }
}
// Initialize the application
async function initializeApp() {
    await initializePresets();
    // Debug: Check config values after preset application
    console.log('Config values after preset application:', {
        cellSize: config.cellSize,
        tickRate: config.tickRate,
        activeCellDensity: config.activeCellDensity,
        colorSettings: config.colorSettings,
        binaryTransitions: config.binaryTransitions
    });
    // Wait a moment for macros to be fully applied
    await new Promise(resolve => setTimeout(resolve, 100));
    setupUI(updateConfig);
    setupMacrosUI((macro) => {
        // Optionally integrate with key controls.
    });
    createSimulation();
    tickManager.onTick(onTick);
    tickManager.start();
    setupKeyControls(config, () => { }, console.log);
}
// Start the application
initializeApp();
// Hide UI by default
window.addEventListener('DOMContentLoaded', () => {
    const paramPanel = document.getElementById('parametersPanel');
    const macrosPanel = document.getElementById('macrosPanel');
    if (paramPanel && macrosPanel) {
        paramPanel.style.display = 'none';
        macrosPanel.style.display = 'none';
    }
});
window.addEventListener('keydown', (e) => {
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
//# sourceMappingURL=app.js.map