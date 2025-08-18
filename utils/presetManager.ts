/**
 * Algorithmic Visual Evolution - Preset Manager
 * 
 * Handles preset operations:
 * - Loading random presets on startup
 * - Saving current configurations as new presets
 * - Managing preset files in the presets directory
 */

import { config, Config } from '../config.js';
import { Macro } from './macros.js';

export interface Preset {
  name: string;
  config: Partial<Config>;
  macros?: Macro[];
}

export class PresetManager {
  private static instance: PresetManager;
  private presets: Preset[] = [];

  private constructor() {}

  static getInstance(): PresetManager {
    if (!PresetManager.instance) {
      PresetManager.instance = new PresetManager();
    }
    return PresetManager.instance;
  }

  async loadPresets(): Promise<void> {
    try {
      // Load all presets from the main presets folder
      const allPresets = await this.loadAllPresets();
      
      // Combine all presets
      this.presets = allPresets;
      
      console.log(`Loaded ${this.presets.length} total presets:`);
      this.presets.forEach((preset, index) => {
        console.log(`  ${index}: ${preset.name}`);
      });
      
      // If no presets loaded at all, create a basic default
      if (this.presets.length === 0) {
        console.warn('No presets found, creating basic default');
        this.presets.push(this.createBasicDefault());
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  }

  private createBasicDefault(): Preset {
    return {
      name: 'basic-default',
      config: {
        cellSize: 10,
        tickRate: 60,
        activeCellDensity: 0.62,
        colorSettings: {
          baseH: 0,
          baseS: 100,
          baseB: 100,
          scheme: "analogous"
        }
      },
      macros: []
    };
  }

  private async loadAllPresets(): Promise<Preset[]> {
    const allPresets: Preset[] = [];
    
    // List of preset files to try loading - we'll try all JSON files
    const presetFiles = ['default.json', 'jewels.json', 'mandalas.json'];
    
    console.log('Attempting to load all presets:', presetFiles);
    
    for (const filename of presetFiles) {
      try {
        console.log(`Loading preset: ${filename}`);
        const preset = await this.loadPresetFile(filename);
        if (preset) {
          console.log(`Successfully loaded preset: ${preset.name}`);
          allPresets.push(preset);
        } else {
          console.warn(`Failed to load preset: ${filename} (returned null)`);
        }
      } catch (error) {
        console.error(`Failed to load preset ${filename}:`, error);
      }
    }
    
    console.log(`Total presets loaded: ${allPresets.length}`);
    return allPresets;
  }

  private async loadPresetFile(filename: string): Promise<Preset | null> {
    try {
      console.log(`Fetching preset from: presets/${filename}`);
      const response = await fetch(`presets/${filename}`);
      console.log(`Response status for ${filename}:`, response.status, response.statusText);
      
      if (!response.ok) {
        console.warn(`Could not load preset: ${filename} - Status: ${response.status}`);
        return null;
      }
      
      const presetData = await response.json();
      console.log(`Successfully parsed preset ${filename}:`, presetData);
      
      // Extract config and macros from the preset data
      const { macros, ...configData } = presetData;
      
      return {
        name: filename.replace('.json', ''),
        config: configData,
        macros: macros || []
      };
    } catch (error) {
      console.error(`Error loading preset ${filename}:`, error);
      return null;
    }
  }

  getRandomPreset(): Preset | null {
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
    
    // Randomly select from all available presets
    const randomIndex = Math.floor(Math.random() * this.presets.length);
    const selectedPreset = this.presets[randomIndex];
    console.log(`Randomly selected preset: ${selectedPreset.name} (index: ${randomIndex})`);
    return selectedPreset;
  }



  applyPreset(preset: Preset): void {
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
    } else {
      console.log('No macros to apply from preset');
    }
    
    console.log(`Successfully applied preset: ${preset.name}`);
  }

  async saveCurrentConfig(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const presetName = `preset-${timestamp}`;
    
    // Create a copy of the current config (excluding internal properties)
    const configCopy = { ...config };
    delete configCopy._overrides;
    delete configCopy.derivedColors;
    
    // Get current macros
    let currentMacros: Macro[] = [];
    try {
      const { macros } = await import('./macrosUI.js');
      currentMacros = [...macros];
    } catch (error) {
      console.warn('Failed to get current macros:', error);
    }
    
    const preset: Preset = {
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
    } catch (error) {
      console.error('Error saving preset:', error);
      throw error;
    }
  }



  private downloadPresetAsJSON(preset: Preset): void {
    // Create the complete preset data including both config and macros
    const presetData = {
      ...preset.config,
      macros: preset.macros || []
    };
    
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

  getPresetNames(): string[] {
    return this.presets.map(preset => preset.name);
  }

  getPresets(): Preset[] {
    return [...this.presets];
  }
}

export const presetManager = PresetManager.getInstance(); 