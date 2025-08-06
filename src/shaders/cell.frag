precision mediump float;

// Varying received from the vertex shader
varying vec2 uv;

// Uniforms (data passed from JavaScript)
uniform sampler2D cellStateTexture; // R: alive, G: age, B: custom, A: alpha
uniform vec2 resolution;          // Canvas resolution

// Kaleidoscope Uniforms
uniform int u_kaleidoscopeSectors; // Number of sectors
uniform vec2 u_kaleidoscopeCenter; // Center point (0.0 to 1.0)
uniform float u_kaleidoscopeAngleOffset; // Rotation offset in radians
uniform float u_kaleidoscopeZoom; // Zoom factor

// Config uniforms (needed for color calculation)
// These should ideally come from a dedicated config uniform struct if it gets complex
// Or pass individual relevant values as needed.
uniform float u_hueSpeed; // Renamed from config.kaleidoscope.hueSpeed
uniform float u_saturation; // Renamed from config.kaleidoscope.saturation
uniform float u_brightness; // Renamed from config.kaleidoscope.brightness

// Output
out vec4 fragColor;

// Function to convert HSB to RGB
// Input: H in [0, 360), S in [0, 1], B in [0, 1]
// Output: vec3 RGB color in [0, 1]
vec3 hsb2rgb(float h, float s, float b) {
    h = mod(h, 360.0); // Ensure hue wraps around
    vec3 rgb = clamp(abs(mod(h / 60.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb); // Smoothstep calculation
    return b * mix(vec3(1.0), rgb, s);
}

// Function to apply kaleidoscope transformation to UV coordinates
vec2 applyKaleidoscope(vec2 uvCoord, vec2 center, int sectors, float angleOffset, float zoom) {
    vec2 centeredUv = uvCoord - center;
    
    // Handle zoom - apply before angle calculation for correct scaling from center
    centeredUv /= zoom; // Inverse zoom for coordinate transformation

    float angle = atan(centeredUv.y, centeredUv.x) - angleOffset; // Apply offset
    float dist = length(centeredUv);

    float sectorAngle = 2.0 * 3.1415926535 / float(sectors);
    angle = mod(angle, sectorAngle);
    angle = abs(angle - sectorAngle * 0.5); // Mirror within the sector

    // Reconstruct position and add center back
    return center + vec2(cos(angle + angleOffset), sin(angle + angleOffset)) * dist * zoom; 
}

void main() {
    vec2 transformedUv = uv; // Start with original UVs

    // Apply kaleidoscope only if sectors > 0
    if (u_kaleidoscopeSectors > 0) {
        transformedUv = applyKaleidoscope(
            uv,
            u_kaleidoscopeCenter,
            u_kaleidoscopeSectors,
            u_kaleidoscopeAngleOffset,
            u_kaleidoscopeZoom
        );
    }

    // Look up the cell state using the (potentially transformed) UVs
    // Use clamp-to-edge wrapping implicitly handled by texture settings or explicitly if needed
    transformedUv = clamp(transformedUv, 0.0, 1.0); // Ensure UVs stay within bounds after transform
    vec4 stateData = texture2D(cellStateTexture, transformedUv);
    
    float cellState = stateData.r; // Alive state
    float cellAge = stateData.g;   // Age
    float cellAlpha = stateData.a; // Alpha (potentially modified by decay)

    // Determine final color based on state
    if (cellState > 0.5) { // If the cell is alive
        // Color based on age using HSB->RGB conversion
        float hue = mod(cellAge * u_hueSpeed, 360.0) / 360.0; // Normalize hue [0, 1]
        float saturation = u_saturation; // Use config uniform
        float brightness = u_brightness; // Use config uniform

        vec3 color = hsb2rgb(hue, saturation, brightness);

        // Apply cell's alpha
        fragColor = vec4(color, cellAlpha);

    } else {
        // Dead cells are black (or could be semi-transparent black)
        fragColor = vec4(0.0, 0.0, 0.0, 1.0); // Ensure dead cells are opaque black
    }
}

