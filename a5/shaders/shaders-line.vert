uniform mat4 u_worldViewProjection;
uniform vec4 u_horizontalPos;
attribute vec4 a_position;

varying vec4 v_position;

void main() {
  v_position = u_worldViewProjection * (a_position) + u_horizontalPos;
  gl_Position = v_position;
}