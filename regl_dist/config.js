/**
 * Algorithmic Visual Evolution - Configuration
 *
 * Central configuration system that defines:
 * - Core system settings (dimensions, cell size, tick rate)
 * - Growth and decay parameters for cell behaviors
 * - Color settings and processing parameters
 * - Visual effect and transition properties
 *
 * Provides a single source of truth for all configurable parameters
 * used throughout the application.
 */
export const config = {
    // CORE SYSTEM SETTINGS
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    // GRID & CELL SIZE
    cellSize: 10,
    minCellSize: 1,
    maxCellSize: 30,
    // SIMULATION SPEED
    tickRate: 60,
    minTickRate: 2,
    maxTickRate: 200,
    // DECAY SYSTEM
    decay: {
        baseDelay: 100,
        normalStep: 0.02,
        randomRange: 20,
        slowdownFactor: 0.05,
        minDecayChance: 0.002,
        baseDecayChance: 0.35,
        edgeBreakChance: 0.25,
        voidDropChance: 0.10
    },
    // GROWTH SYSTEM
    creepingFig: {
        baseActivations: 5,
        neighborRadius: 2,
        branchAge: 5,
        directionFollowChance: 0.3,
        maxActiveCells: 10000,
        expansionBiasFactor: 0.2,
        bounceReflectionFactor: 1.0
    },
    // HIGH-ENERGY BURSTS
    burstMechanics: {
        pulseChance: 0.12,
        burstSize: 30,
        burstDecayMultiplier: 1.5
    },
    // SYSTEM EQUILIBRIUM
    activeCellDensity: 0.62,
    equilibrium: {
        maxExpansionScale: 7,
        maxDecayScale: 4,
        minExpansionScale: 0.3,
        minDecayScale: 0.15,
        expansionResponse: 1.2,
        decayResponse: 1.1
    },
    // BINARY TRANSITIONS
    binaryTransitions: {
        enabled: false,
        threshold: 0.25
    },
    // COLOR SETTINGS for derived color schemes (using HSB)
    colorSettings: {
        baseH: 0, // Hue (0 - 360)
        baseS: 100, // Saturation (0 - 100)
        baseB: 100, // Brightness (0 - 100)
        scheme: "analogous"
    },
    // Holds derived colors computed from the color settings.
    derivedColors: [],
    // Internal override flags for parameters touched manually.
    _overrides: {}
};
