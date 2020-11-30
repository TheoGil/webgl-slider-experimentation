#pragma glslify: backgroundCover = require(../helpers/backgroundCover);

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_resIn;
uniform vec2 u_resOut;
uniform vec3 u_debugColor;

void main() {
  vec2 uv = backgroundCover(vUv, u_resIn, u_resOut);
  vec4 color = texture2D(u_texture, uv) * vec4(u_debugColor, 1.);
  gl_FragColor = color;
}