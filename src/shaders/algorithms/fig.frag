precision mediump float;

varying vec2 uv; // Texel coordinate (0.0 to 1.0)

// Input Textures
uniform sampler2D prevStateTexture; // R: alive, G: age, B: custom, A: alpha

// Uniforms from config / app state
uniform vec2 resolution;      // Resolution of the texture (width, height)
uniform float time;           // Simulation time
uniform float growthMultiplier; // From EquilibriumManager
uniform float decayMultiplier;  // From EquilibriumManager

// Creeping Fig Config Uniforms
// Use int for radius for loop bounds
uniform int neighborRadius;      // = floor(config.creepingFig.neighborRadius)
uniform float branchAge;         // = config.creepingFig.branchAge
// uniform float directionFollowChance; // Ignoring for simpler probabilistic model

// Decay Config Uniforms
uniform float baseDecayChance;     // = config.decay.baseDecayChance
uniform float decaySlowdownFactor; // = config.decay.slowdownFactor
uniform float minDecayChance;      // = config.decay.minDecayChance
uniform float edgeBreakChance;     // = config.decay.edgeBreakChance

// Binary Transition Config Uniforms (Assuming passed from app.ts)
uniform bool binaryOn;             // = config.binaryTransitions.enabled
uniform float binaryThreshold;     // = config.binaryTransitions.threshold

// Activation constant (tune this value)
const float ACTIVATION_BASE_CHANCE = 0.08; // Base chance scaled by neighbor count

// Output: New state encoded in RGBA
out vec4 fragColor;

// Simple Pseudo-Random Number Generator (Hash function)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Helper to get texel size
vec2 texelSize = 1.0 / resolution;

void main() {
    // 1. Read Current State for this pixel
    vec4 currentState = texture2D(prevStateTexture, uv);
    float alive = currentState.r;
    float age = currentState.g;
    float alpha = currentState.a;

    // Initialize next state based on current state
    vec4 nextState = currentState;

    // --- Growth Logic (Probabilistic Activation) ---
    if (alive < 0.5) { // Only check for activation if currently dead
        int activatingNeighbors = 0;
        // Loop through neighbors to check eligibility
        for (int di = -neighborRadius; di <= neighborRadius; di++) {
            for (int dj = -neighborRadius; dj <= neighborRadius; dj++) {
                if (di == 0 && dj == 0) continue; // Skip self

                vec2 neighborUV = uv + vec2(float(di), float(dj)) * texelSize;
                // Optional: Clamp UVs if edge behavior requires it
                // neighborUV = clamp(neighborUV, vec2(0.0), vec2(1.0));

                vec4 neighborState = texture2D(prevStateTexture, neighborUV);

                if (neighborState.r > 0.5 && neighborState.g >= branchAge) {
                    activatingNeighbors++;
                }
            }
        }

        // Activation Probability
        float activationChance = float(activatingNeighbors) * ACTIVATION_BASE_CHANCE * growthMultiplier;
        activationChance = clamp(activationChance, 0.0, 0.95); // Cap max chance

        if (activatingNeighbors > 0 && random(uv + time) < activationChance) {
            nextState.r = 1.0; // Activate!
            nextState.g = 0.0; // Reset age
            nextState.a = 1.0; // Reset alpha
            // TODO: Set initial color / other properties if needed
        }
    }

    // --- Decay Logic ---
    // Evaluate decay if the cell *was* alive OR *just became* alive
    if (currentState.r > 0.5 || nextState.r > 0.5) {
        age = nextState.g; // Use current age (could be 0 if just activated)

        float currentDecayChance = baseDecayChance / (1.0 + age * decaySlowdownFactor);
        currentDecayChance = max(currentDecayChance, minDecayChance);

        // --- Edge Detection (Check immediate neighbors) ---
        bool isEdge = false;
        for (int di = -1; di <= 1; di++) {
            for (int dj = -1; dj <= 1; dj++) {
                if (di == 0 && dj == 0) continue;
                vec2 neighborUV = uv + vec2(float(di), float(dj)) * texelSize;
                // Check if neighbor is dead (or outside bounds implicitly via clamp/wrap mode)
                if (texture2D(prevStateTexture, neighborUV).r < 0.5) {
                    isEdge = true;
                    break; // Found a dead neighbor, it's an edge
                }
            }
            if (isEdge) break;
        }
        // --- End Edge Detection ---

        float randomValDecay = random(uv - time * 0.9); // Use different seed

        // Apply decay based on edge status
        if (isEdge && randomValDecay < edgeBreakChance * decayMultiplier) {
             nextState.a = max(0.0, alpha - 0.1); // Faster decay at edges
        } else if (randomValDecay < currentDecayChance * decayMultiplier) {
             nextState.a = max(0.0, alpha - 0.015); // Normal decay
        } else {
             nextState.a = alpha; // No decay this frame
        }


        // Check if alpha decay kills the cell
        bool killedByDecay = false;
        if (binaryOn) {
            if (nextState.a < binaryThreshold) {
                 killedByDecay = true;
            }
        } else {
            if (nextState.a < 0.01) { // Threshold for non-binary mode
                 killedByDecay = true;
            }
        }

        if (killedByDecay) {
            nextState.r = 0.0; // Set state to dead
            nextState.g = 0.0; // Reset age
            nextState.a = 0.0; // Ensure alpha is 0
        }

        // Increment age only if it didn't just die
        if (nextState.r > 0.5) {
           nextState.g = age + 1.0;
        }

    } else {
         // Ensure dead cells stay dead (state reset if killed by decay above)
         // If it started dead and wasn't activated, ensure state remains 0
         if (alive < 0.5) {
            nextState = vec4(0.0, 0.0, 0.0, 0.0);
         }
    }

    // Output the calculated next state for this cell
    fragColor = nextState;
}
