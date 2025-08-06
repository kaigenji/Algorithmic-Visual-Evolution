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

