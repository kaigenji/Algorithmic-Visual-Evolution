/**
 * Algorithmic Visual Evolution - UI Manager
 *
 * Handles all aspects of the user interface for parameter control:
 * - Creates and manages sliders, controls, and selectors
 * - Updates visual representation of parameter values
 * - Handles parameter changes and updates configuration
 * - Organizes UI components in the parameter panel
 * - Provides real-time feedback on parameter adjustments
 */
import { config } from '../config.js';
import { availableSchemes } from './colorTheory.js';
// Export an object to store slider references by config path.
export const parameterSliders = {};
// Add a new parameter for Hue (colorSettings.baseH) here as requested.
export const PARAM_DEFINITIONS = [
    {
        path: "cellSize",
        label: "Cell Size",
        description: "Larger cells = chunkier visuals; smaller = finer details.",
        min: config.minCellSize,
        max: config.maxCellSize,
        step: 1,
        type: "range"
    },
    {
        path: "tickRate",
        label: "Simulation Speed (Ticks/sec)",
        description: "Higher = faster animation & updates.",
        min: config.minTickRate,
        max: config.maxTickRate,
        step: 1,
        type: "range"
    },
    {
        path: "activeCellDensity",
        label: "Target Coverage",
        description: "Desired fraction of cells active (0.0 - 1.0).",
        min: 0.1,
        max: 1.0,
        step: 0.01,
        type: "range"
    },
    {
        path: "decay.baseDelay",
        label: "Decay Delay",
        description: "Ticks before a new cell is allowed to decay.",
        min: 0,
        max: 500,
        step: 10,
        type: "range"
    },
    {
        path: "decay.baseDecayChance",
        label: "Decay Chance",
        description: "Initial probability a cell fades each tick (0 - 1).",
        min: 0,
        max: 1,
        step: 0.01,
        type: "range"
    },
    {
        path: "creepingFig.baseActivations",
        label: "Growth Attempts",
        description: "Expansions a single active cell tries per tick.",
        min: 1,
        max: 20,
        step: 1,
        type: "range"
    },
    {
        path: "creepingFig.neighborRadius",
        label: "Spread Radius",
        description: "Max distance a cell can expand in one step.",
        min: 1,
        max: 5,
        step: 1,
        type: "range"
    },
    {
        path: "creepingFig.branchAge",
        label: "Branching Age",
        description: "Ticks a cell must live before spawning new branches.",
        min: 0,
        max: 30,
        step: 1,
        type: "range"
    },
    {
        path: "creepingFig.directionFollowChance",
        label: "Directional Persistence",
        description: "Chance of continuing along the same path (0 - 1).",
        min: 0,
        max: 1,
        step: 0.01,
        type: "range"
    },
    {
        path: "binaryTransitions.enabled",
        label: "Binary Death Switch",
        description: "Fully opaque vs. dead once alpha < threshold.",
        type: "checkbox"
    },
    {
        path: "binaryTransitions.threshold",
        label: "Binary Death Threshold",
        description: "Alpha cutoff; below => cell dies immediately.",
        min: 0,
        max: 1,
        step: 0.01,
        type: "range"
    },
    {
        path: "colorSettings.baseH",
        label: "Hue",
        description: "Base Hue (0 - 360°).",
        min: 0,
        max: 360,
        step: 1,
        type: "range"
    }
];
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
function createRange(def, updateConfigFn) {
    const container = document.createElement('div');
    container.classList.add('slider-container');
    const label = document.createElement('label');
    label.textContent = def.label;
    const desc = document.createElement('p');
    desc.classList.add('param-desc');
    desc.textContent = def.description;
    const slider = document.createElement('input');
    slider.type = 'range';
    if (def.min !== undefined)
        slider.setAttribute('min', def.min.toString());
    if (def.max !== undefined)
        slider.setAttribute('max', def.max.toString());
    if (def.step !== undefined)
        slider.setAttribute('step', def.step.toString());
    slider.setAttribute('value', getConfigValueByPath(def.path).toString());
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = (Math.round(parseFloat(slider.value) * 100) / 100).toString();
    slider.addEventListener('mousedown', () => {
        // Mark parameter as being adjusted
        if (window.setParameterBeingAdjusted) {
            window.setParameterBeingAdjusted(def.path, true);
        }
    });
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        valueDisplay.textContent = (Math.round(val * 100) / 100).toString();
        config._overrides[def.path] = true;
        setConfigValueByPath(def.path, val);
        updateConfigFn(def.path, val);
    });
    slider.addEventListener('mouseup', () => {
        // Mark parameter as no longer being adjusted
        if (window.setParameterBeingAdjusted) {
            window.setParameterBeingAdjusted(def.path, false);
        }
    });
    container.appendChild(label);
    container.appendChild(desc);
    container.appendChild(slider);
    container.appendChild(valueDisplay);
    parameterSliders[def.path] = { slider, valueDisplay };
    return container;
}
function createCheckbox(def, updateConfigFn) {
    const container = document.createElement('div');
    container.classList.add('checkbox-container');
    const label = document.createElement('label');
    label.textContent = def.label;
    const desc = document.createElement('p');
    desc.classList.add('param-desc');
    desc.textContent = def.description;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!getConfigValueByPath(def.path);
    checkbox.addEventListener('change', (e) => {
        const val = e.target.checked;
        setConfigValueByPath(def.path, val);
        updateConfigFn(def.path, val);
    });
    container.appendChild(label);
    container.appendChild(desc);
    container.appendChild(checkbox);
    return container;
}
function createColorSettings(updateConfigFn) {
    const container = document.createElement('div');
    container.classList.add('slider-container');
    container.appendChild(createRange({
        path: "colorSettings.baseH",
        label: "Hue",
        description: "Base hue (0 - 360°).",
        min: 0,
        max: 360,
        step: 1,
        type: "range"
    }, updateConfigFn));
    container.appendChild(createRange({
        path: "colorSettings.baseS",
        label: "Saturation",
        description: "Base saturation (0 - 100%).",
        min: 0,
        max: 100,
        step: 1,
        type: "range"
    }, updateConfigFn));
    container.appendChild(createRange({
        path: "colorSettings.baseB",
        label: "Brightness",
        description: "Base brightness (0 - 100%).",
        min: 0,
        max: 100,
        step: 1,
        type: "range"
    }, updateConfigFn));
    const schemeContainer = document.createElement('div');
    schemeContainer.classList.add('checkbox-container');
    const schemeLabel = document.createElement('label');
    schemeLabel.textContent = "Color Scheme";
    schemeContainer.appendChild(schemeLabel);
    const schemeDesc = document.createElement('p');
    schemeDesc.classList.add('param-desc');
    schemeDesc.textContent = "Select a color scheme.";
    schemeContainer.appendChild(schemeDesc);
    const select = document.createElement('select');
    availableSchemes.forEach(schemeName => {
        const option = document.createElement('option');
        option.value = schemeName;
        option.textContent = schemeName;
        select.appendChild(option);
    });
    select.addEventListener('change', (e) => {
        const schemeName = e.target.value;
        // The color scheme will be applied by the colorTheory module
        updateConfigFn("colorScheme", schemeName);
    });
    schemeContainer.appendChild(select);
    container.appendChild(schemeContainer);
    return container;
}
export function setupUI(updateConfigFn) {
    const glassInner = document.querySelector('#parametersPanel .glass-inner');
    const title = document.createElement('h3');
    title.textContent = "Parameters";
    glassInner.appendChild(title);
    PARAM_DEFINITIONS.forEach(def => {
        let control;
        if (def.type === 'range') {
            control = createRange(def, updateConfigFn);
        }
        else if (def.type === 'checkbox') {
            control = createCheckbox(def, updateConfigFn);
        }
        glassInner.appendChild(control);
    });
    glassInner.appendChild(createColorSettings(updateConfigFn));
}
//# sourceMappingURL=uiManager.js.map