precision mediump float;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_colorMult;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;
uniform vec4 u_ambient;
uniform sampler2D u_letter;
uniform vec4 u_colorOfLetter;

vec4 lit(float l ,float h, float m) {
  return vec4(1.0,
              abs(l),
              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
              1.0);
}

void main() {
  // we aren't doing anything with texture coordinates, but can use them
  // as part of rendering
  vec4 letter = texture2D(u_letter, v_texCoord);
  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToLight = normalize(v_surfaceToLight);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLight + surfaceToView);
  vec4 litR = lit(dot(a_normal, surfaceToLight),
                    dot(a_normal, halfVector), u_shininess);
  vec4 outColor = vec4((u_lightColor * (litR.y * u_colorMult +
                                        u_specular * litR.z * u_specularFactor)).rgb,
                        1.0);

  // use this one to color the surface grey based on the dot between the lights and normal     
  //gl_FragColor = vec4(dot(a_normal, surfaceToLight),dot(a_normal, surfaceToLight),dot(a_normal, surfaceToLight), 1);
  
  // the actual computed color
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  if (letter.x > 0.5 && letter.y > 0.5 && letter.z > 0.5) {
    gl_FragColor = outColor + u_ambient;
  }
}
