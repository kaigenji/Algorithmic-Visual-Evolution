/**
 * Algorithmic Visual Evolution - Type Definitions
 * 
 * Central location for shared TypeScript interfaces and types used across the application:
 * - Color types (RGB, HSB)
 * - Cell structure definitions (Minimal for GPU state concept)
 * - Parameter and configuration interfaces
 * 
 * Ensures consistent typing across modules and improves code maintainability.
 */

// Removed import for Direction as gridManager is no longer used in src
// import { Direction } from './utils/gridManager.js';

export interface RGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSB {
  h: number;
  s: number;
  b: number;
}

// Minimal Cell definition - Represents conceptual data, 
// actual state likely stored across texture channels (R=alive, G=age, etc.)
export interface Cell {
  state: number;
  color?: RGB; // Color might be derived or stored separately
  birth?: number;
  // prevDir?: Direction; // Removed - Handled differently in shaders
  decayDelay?: number;
  decaying?: boolean;
}

export interface Config {
  canvasWidth: number; 
  canvasHeight: number;
  cellSize: number;
  minCellSize: number;
  maxCellSize: number;
  minTickRate: number;
  maxTickRate: number;
  decay: {
    baseDelay: number;
    baseDecayChance: number;
    slowdownFactor: number;
    minDecayChance: number;
    edgeBreakChance: number;
    randomRange: number;
    // Add any other decay params needed as uniforms
  };
  creepingFig: {
    baseActivations: number;
    neighborRadius: number;
    branchAge: number;
    directionFollowChance: number;
    // Add any other fig params needed as uniforms
  };
  binaryTransitions: {
    enabled: boolean;
    threshold: number;
  };
  colorSettings: {
    baseH: number;
    baseS: number;
    baseB: number;
    scheme?: string;
  };
  kaleidoscope: {
    sectors: number;
    centerX: number;
    centerY: number;
    angleOffset: number; // Degrees
    zoom: number;
    hueSpeed: number;
    saturation: number;
    brightness: number;
  };
  derivedColors?: HSB[]; // Might be used for initial palette generation
  _overrides: Record<string, boolean>; // Keep if UI interaction modifies config
  activeCellDensity: number; // Added this during equilibrium implementation
  equilibrium: { // Added this during equilibrium implementation
      maxExpansionScale: number;
      minExpansionScale: number;
      expansionResponse: number;
      maxDecayScale: number;
      minDecayScale: number;
      decayResponse: number;
  };
}

export interface ParameterDefinition {
  path: string;
  label: string;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  type: "range" | "checkbox";
}

// Removed BounceFunction as it relates to CPU grid logic
// export type BounceFunction = (newI: number, newJ: number, offset: Direction) => { newI: number; newJ: number } | null; 