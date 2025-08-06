/**
 * Algorithmic Visual Evolution - Main Application (Regl Version)
 *
 * Entry point for the regl-based application:
 * - Initializes regl and WebGL context
 * - Loads shaders
 * - Sets up GPU state (textures, framebuffers)
 * - Defines regl commands for update and render passes
 * - Runs the main animation loop
 */
// File: src/app.ts
import { config } from './config.js'; // Keep config for parameters
import * as regl from 'regl'; // Import regl
// --- Shader Source Code --- 
// Embed shaders directly as strings for simplicity
const cellVertShader = `
precision mediump float;

// Attribute received from the buffer
attribute vec2 position;

// Varying to pass texture coordinates to the fragment shader
varying vec2 uv;

void main() {
  // Map vertex position from [-1, 1] range to [0, 1] UV range
  uv = 0.5 * (position + 1.0);
  
  // Output the vertex position
  gl_Position = vec4(position, 0, 1);
}
`;
const cellFragShader = `
precision mediump float;

// Varying received from the vertex shader
varying vec2 uv;

// Uniforms (data passed from JavaScript)
uniform sampler2D cellStateTexture; // Texture containing state (R=alive, G=age, B=?, A=alpha)
// uniform sampler2D cellColorTexture; // Color might be derived from state or another texture
uniform vec2 resolution;          // Canvas resolution

void main() {
  // Look up the cell state from the texture
  vec4 stateData = texture2D(cellStateTexture, uv);
  float cellState = stateData.r; // Alive state
  float cellAge = stateData.g;   // Age
  float cellAlpha = stateData.a; // Alpha

  // Set the final color based on state
  if (cellState > 0.5) { // If the cell is alive 
    // Example: Color based on age (simple gradient)
    float hue = mod(cellAge * 0.1, 360.0);
    // Simplified HSB to RGB (or use a color texture lookup)
    vec3 color = vec3(1.0, 0.5, 0.0); // Placeholder: Orange
    gl_FragColor = vec4(color, cellAlpha); 
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Dead cells are black
  }
}
`;
// Placeholder for the update shader - Load actual GLSL later
const figUpdateShader = `
precision mediump float;
varying vec2 uv;
uniform sampler2D prevStateTexture; // Read from the previous state
uniform float time;
uniform vec2 resolution;

// Placeholder: Simple logic, replace with actual Creeping Fig GLSL
void main() {
  vec4 prevState = texture2D(prevStateTexture, uv);
  float newState = prevState.r; // Keep previous state for now
  float newAge = prevState.g + 1.0; // Increment age
  float newAlpha = prevState.a;

  // Simple condition to spawn a cell (replace with fig logic)
  if (prevState.r < 0.5 && fract(sin(dot(uv + time * 0.01, vec2(12.9898, 78.233))) * 43758.5453) > 0.995) {
     newState = 1.0;
     newAge = 0.0;
     newAlpha = 1.0;
  }

  // Simple decay (replace with fig logic)
   if (prevState.r > 0.5 && fract(sin(dot(uv + time * 0.02, vec2(10.1, 55.7))) * 33123.1) > 0.99) {
     newState = 0.0;
     newAlpha = 0.0;
   }


  gl_FragColor = vec4(newState, newAge, 0.0, newAlpha); // Output new state
}
`;
console.log("AVE Regl Setup Initializing...");
// Main setup function
function initializeReglApp() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    // Adjust canvas size based on config (or keep window size)
    canvas.width = config.canvasWidth || window.innerWidth;
    canvas.height = config.canvasHeight || window.innerHeight;
    // Create regl instance
    const reglInstance = regl({
        canvas: canvas,
        extensions: ['oes_texture_float'], // Needed for float textures to store precise state
        // Optional: specify attributes for the context if needed
    });
    if (!reglInstance) {
        console.error("Regl initialization failed");
        return;
    }
    console.log("Regl Initialized.");
    // --- Equilibrium State ---
    let currentGrowthMultiplier = 1.0;
    let currentDecayMultiplier = 1.0;
    // Function to update equilibrium multipliers
    // TODO: Implement proper coverage calculation later (e.g., readPixels or reduction)
    function updateEquilibrium(placeholderCoverage = 0.5) {
        const eqCfg = config.equilibrium; // Assuming config structure is similar
        const targetFraction = config.activeCellDensity;
        // Original EquilibriumManager logic (simplified, check config paths if needed)
        const difference = targetFraction - placeholderCoverage;
        let relativeDiff = Math.log1p(Math.abs(difference)); // Using log1p for better scaling near 0
        let growthScale = 1.0;
        let decayScale = 1.0;
        if (difference > 0) { // Need more cells
            growthScale = 1.0 + (relativeDiff * eqCfg.maxExpansionScale * eqCfg.expansionResponse);
            decayScale = Math.max(1.0 - (relativeDiff * eqCfg.decayResponse), eqCfg.minDecayScale);
        }
        else { // Need fewer cells
            growthScale = Math.max(1.0 - (relativeDiff * eqCfg.expansionResponse), eqCfg.minExpansionScale);
            decayScale = 1.0 + (relativeDiff * eqCfg.maxDecayScale * eqCfg.decayResponse);
        }
        // Apply limits 
        currentGrowthMultiplier = Math.max(eqCfg.minExpansionScale, Math.min(eqCfg.maxExpansionScale, growthScale));
        currentDecayMultiplier = Math.max(eqCfg.minDecayScale, Math.min(eqCfg.maxDecayScale, decayScale));
        // Simple smoothing (can use lerp for smoother transitions)
        // currentGrowthMultiplier = lerp(currentGrowthMultiplier, calculatedGrowth, 0.1);
        // currentDecayMultiplier = lerp(currentDecayMultiplier, calculatedDecay, 0.1);
        // console.log(`Coverage: ${placeholderCoverage.toFixed(3)}, GrowthM: ${currentGrowthMultiplier.toFixed(3)}, DecayM: ${currentDecayMultiplier.toFixed(3)}`);
    }
    // --- State Textures & Framebuffers Setup ---
    console.log("Setting up state...");
    // Determine grid dimensions based on canvas and cellSize
    const texWidth = Math.floor((config.canvasWidth || window.innerWidth) / config.cellSize);
    const texHeight = Math.floor((config.canvasHeight || window.innerHeight) / config.cellSize);
    console.log(`State texture dimensions: ${texWidth} x ${texHeight}`);
    // Create two state textures (ping-pong)
    // RGBA channels: R: Alive (0/1), G: Age, B: Custom, A: Alpha/Decay
    const stateTextures = Array(2).fill(0).map(() => reglInstance.texture({
        width: texWidth,
        height: texHeight,
        type: 'float',
        wrap: 'clamp'
    }));
    // Create two Framebuffer Objects (FBOs), one for each texture
    const stateFbos = Array(2).fill(0).map((_, i) => reglInstance.framebuffer({ color: stateTextures[i] }));
    // Simple object to manage the current read/write state
    // Now tracks textures directly, FBOs are used when setting render target
    let currentState = {
        readTex: stateTextures[0],
        writeTex: stateTextures[1],
        readFbo: stateFbos[0], // Keep FBOs for setting render target
        writeFbo: stateFbos[1]
    };
    // Function to swap the read/write states (textures and FBOs)
    function swapState() {
        let tempTex = currentState.readTex;
        currentState.readTex = currentState.writeTex;
        currentState.writeTex = tempTex;
        let tempFbo = currentState.readFbo;
        currentState.readFbo = currentState.writeFbo;
        currentState.writeFbo = tempFbo;
    }
    // Initialize the state textures
    stateFbos.forEach(fbo => {
        reglInstance({ framebuffer: fbo })(() => {
            reglInstance.clear({ color: [0, 0, 0, 0] }); // Clear to dead state
        });
    });
    console.log("Initial state textures cleared.");
    // --- Activate Initial Cell ---
    console.log("Activating initial cell...");
    const centerX = Math.floor(texWidth / 2);
    const centerY = Math.floor(texHeight / 2);
    // State for the initial cell: [Alive, Age, Custom, Alpha]
    const initialCellData = new Float32Array([1.0, 0.0, 0.0, 1.0]);
    // Update a subregion of the texture we will read from first
    // Call the texture object like a function with update parameters
    const initialTexture = currentState.readTex; // Get the texture object
    initialTexture.subimage({ data: initialCellData, width: 1, height: 1 }, // Data and its dimensions
    centerX, // x offset
    centerY // y offset
    );
    console.log(`Initial cell activated at [${centerX}, ${centerY}] in readTex.`);
    console.log("State textures and FBOs created and initialized.");
    // --- Regl Command Definitions ---
    console.log("Defining commands...");
    // Geometry for drawing a full-screen quad
    const quadVertices = [
        [-1, -1], [+1, -1], [-1, +1], // Triangle 1
        [-1, +1], [+1, -1], [+1, +1] // Triangle 2
    ];
    // Define command for the simulation update pass
    const runUpdate = reglInstance({
        frag: figUpdateShader,
        vert: cellVertShader,
        attributes: {
            position: quadVertices
        },
        count: quadVertices.length,
        uniforms: {
            prevStateTexture: () => currentState.readTex,
            time: ({ time }) => time,
            resolution: [texWidth, texHeight],
            // Pass dynamic multipliers
            growthMultiplier: () => currentGrowthMultiplier,
            decayMultiplier: () => currentDecayMultiplier,
            // Config uniforms
            neighborRadius: Math.floor(config.creepingFig.neighborRadius), // Ensure integer
            branchAge: config.creepingFig.branchAge,
            baseDecayChance: config.decay.baseDecayChance,
            decaySlowdownFactor: config.decay.slowdownFactor,
            minDecayChance: config.decay.minDecayChance,
            edgeBreakChance: config.decay.edgeBreakChance,
            // Binary transition uniforms
            binaryOn: config.binaryTransitions.enabled,
            binaryThreshold: config.binaryTransitions.threshold
        },
        framebuffer: () => currentState.writeFbo
    });
    // Define command for the final render-to-screen pass
    const renderToScreen = reglInstance({
        frag: cellFragShader, // Use the final rendering shader
        vert: cellVertShader,
        attributes: {
            position: quadVertices
        },
        count: quadVertices.length,
        uniforms: {
            // Texture containing the *current* state (read from)
            // Pass the texture object directly
            cellStateTexture: () => currentState.readTex,
            // Resolution of the canvas
            resolution: ({ drawingBufferWidth, drawingBufferHeight }) => [drawingBufferWidth, drawingBufferHeight],
            // --- Kaleidoscope Uniforms ---
            u_kaleidoscopeSectors: () => config.kaleidoscope.sectors,
            u_kaleidoscopeCenter: () => [
                config.kaleidoscope.centerX / (config.canvasWidth || window.innerWidth),
                config.kaleidoscope.centerY / (config.canvasHeight || window.innerHeight)
            ],
            u_kaleidoscopeAngleOffset: () => config.kaleidoscope.angleOffset * (Math.PI / 180.0), // Convert degrees to radians
            u_kaleidoscopeZoom: () => config.kaleidoscope.zoom,
            // --- Color Calculation Uniforms (from config) ---
            u_hueSpeed: () => config.kaleidoscope.hueSpeed,
            u_saturation: () => config.kaleidoscope.saturation,
            u_brightness: () => config.kaleidoscope.brightness,
        },
        // Render to the default framebuffer (the screen)
        framebuffer: null
    });
    console.log("Regl commands defined.");
    // --- Main Animation Loop ---
    console.log("Starting main loop...");
    reglInstance.frame(({ time }) => {
        // 0. Update equilibrium multipliers (using placeholder coverage)
        // TODO: Replace placeholder 0.5 with actual coverage value
        updateEquilibrium(0.5);
        // 1. Run the update command(s)
        runUpdate();
        // 2. Run the render command
        renderToScreen();
        // 3. Swap the state textures/FBOs for the next frame
        swapState();
    });
    console.log("Main loop started.");
}
// Wait for the DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', initializeReglApp);
window.updateConfig = function (path, val) {
    console.log(`[Config Updated] ${path} = ${val}`);
    // TODO: Update uniforms or trigger recompilation if necessary
};
// --- Helper Functions (if needed) --- 
