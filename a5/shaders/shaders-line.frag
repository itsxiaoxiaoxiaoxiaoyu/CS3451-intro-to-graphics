precision mediump float;

varying vec4 v_position;
uniform float u_height;
uniform vec4 u_colorMult;

void main() {
  if (v_position.y < u_height) {
    discard;
  }
  gl_FragColor = u_colorMult;
}
