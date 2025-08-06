/**
 * Algorithmic Visual Evolution - Preset Manager
 *
 * Handles preset operations:
 * - Loading random presets on startup
 * - Saving current configurations as new presets
 * - Managing preset files in the presets directory
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { config } from '../config.js';
export class PresetManager {
    constructor() {
        this.presets = [];
    }
    static getInstance() {
        if (!PresetManager.instance) {
            PresetManager.instance = new PresetManager();
        }
        return PresetManager.instance;
    }
    loadPresets() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Load all preset files from the presets folder only
                const presetFiles = yield this.loadAllPresetFiles();
                this.presets = presetFiles;
                console.log(`Loaded ${this.presets.length} presets from presets/ folder:`, presetFiles.map(p => p.name));
            }
            catch (error) {
                console.error('Error loading presets:', error);
            }
        });
    }
    loadAllPresetFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const presetFiles = [];
            // List of known preset files to try loading
            const knownPresets = ['default.json', 'tesssst.json'];
            console.log('Attempting to load preset files:', knownPresets);
            for (const filename of knownPresets) {
                try {
                    console.log(`Loading preset file: ${filename}`);
                    const preset = yield this.loadPresetFile(filename);
                    if (preset) {
                        console.log(`Successfully loaded preset: ${preset.name}`);
                        presetFiles.push(preset);
                    }
                    else {
                        console.warn(`Failed to load preset: ${filename} (returned null)`);
                    }
                }
                catch (error) {
                    console.error(`Failed to load preset ${filename}:`, error);
                }
            }
            console.log(`Total preset files loaded: ${presetFiles.length}`);
            return presetFiles;
        });
    }
    loadPresetFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Fetching preset from: presets/${filename}`);
                const response = yield fetch(`presets/${filename}`);
                console.log(`Response status for ${filename}:`, response.status, response.statusText);
                if (!response.ok) {
                    console.warn(`Could not load preset: ${filename} - Status: ${response.status}`);
                    return null;
                }
                const presetData = yield response.json();
                console.log(`Successfully parsed preset ${filename}:`, presetData);
                // Extract config and macros from the preset data
                const { macros } = presetData, configData = __rest(presetData, ["macros"]);
                return {
                    name: filename.replace('.json', ''),
                    config: configData,
                    macros: macros || []
                };
            }
            catch (error) {
                console.error(`Error loading preset ${filename}:`, error);
                return null;
            }
        });
    }
    getRandomPreset() {
        console.log(`Available presets for random selection: ${this.presets.length}`);
        this.presets.forEach((preset, index) => {
            console.log(`  ${index}: ${preset.name}`);
        });
        if (this.presets.length === 0) {
            console.warn('No presets available for random selection');
            return null;
        }
        // If there's only one preset, always return it (no randomness needed)
        if (this.presets.length === 1) {
            const selectedPreset = this.presets[0];
            console.log(`Only one preset available: ${selectedPreset.name}`);
            return selectedPreset;
        }
        const randomIndex = Math.floor(Math.random() * this.presets.length);
        const selectedPreset = this.presets[randomIndex];
        console.log(`Randomly selected preset: ${selectedPreset.name} (index: ${randomIndex})`);
        return selectedPreset;
    }
    applyPreset(preset) {
        if (!preset || !preset.config) {
            console.warn('Invalid preset provided to applyPreset:', preset);
            return;
        }
        console.log(`Applying preset: ${preset.name}`);
        console.log('Preset config:', preset.config);
        // Apply the preset configuration
        Object.assign(config, preset.config);
        // Ensure canvas dimensions are set correctly
        config.canvasWidth = window.innerWidth;
        config.canvasHeight = window.innerHeight;
        console.log('Applied config values:', {
            cellSize: config.cellSize,
            tickRate: config.tickRate,
            activeCellDensity: config.activeCellDensity,
            colorSettings: config.colorSettings
        });
        // Apply macros if they exist
        if (preset.macros && preset.macros.length > 0) {
            console.log(`Applying ${preset.macros.length} macros from preset`);
            // Import and apply macros
            import('./macrosUI.js').then(({ macros }) => {
                import('./macros.js').then(({ Macro }) => {
                    console.log('Before clearing macros, count:', macros.length);
                    // Clear existing macros
                    macros.length = 0;
                    console.log('After clearing macros, count:', macros.length);
                    // Reconstruct macros as proper Macro instances
                    const reconstructedMacros = preset.macros.map(macroData => {
                        const macro = new Macro();
                        Object.assign(macro, macroData);
                        return macro;
                    });
                    // Add reconstructed macros
                    macros.push(...reconstructedMacros);
                    console.log(`Successfully applied ${reconstructedMacros.length} macros from preset`);
                    console.log('Final macros array:', macros);
                }).catch(error => {
                    console.error('Failed to import Macro class:', error);
                });
            }).catch(error => {
                console.error('Failed to apply macros:', error);
            });
        }
        else {
            console.log('No macros to apply from preset');
        }
        console.log(`Successfully applied preset: ${preset.name}`);
    }
    saveCurrentConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const presetName = `preset-${timestamp}`;
            // Create a copy of the current config (excluding internal properties)
            const configCopy = Object.assign({}, config);
            delete configCopy._overrides;
            delete configCopy.derivedColors;
            // Get current macros
            let currentMacros = [];
            try {
                const { macros } = yield import('./macrosUI.js');
                currentMacros = [...macros];
            }
            catch (error) {
                console.warn('Failed to get current macros:', error);
            }
            const preset = {
                name: presetName,
                config: configCopy,
                macros: currentMacros
            };
            try {
                // Create downloadable JSON file (this is the only storage method now)
                this.downloadPresetAsJSON(preset);
                console.log(`Saved preset: ${presetName} with ${currentMacros.length} macros`);
                console.log('Preset saved as downloadable JSON file. Add it to the presets/ folder to include it in random selection.');
                return presetName;
            }
            catch (error) {
                console.error('Error saving preset:', error);
                throw error;
            }
        });
    }
    downloadPresetAsJSON(preset) {
        // Create the complete preset data including both config and macros
        const presetData = Object.assign(Object.assign({}, preset.config), { macros: preset.macros || [] });
        const jsonContent = JSON.stringify(presetData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${preset.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    getPresetNames() {
        return this.presets.map(preset => preset.name);
    }
    getPresets() {
        return [...this.presets];
    }
}
export const presetManager = PresetManager.getInstance();
//# sourceMappingURL=presetManager.js.map