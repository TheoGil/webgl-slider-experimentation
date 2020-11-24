#pragma glslify: backgroundCover = require(../helpers/backgroundCover);

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_resIn;
uniform vec2 u_resOut;

void main() {
  vec2 uv = backgroundCover(vUv, u_resIn, u_resOut);
  vec4 color = texture2D(u_texture, uv);
  gl_FragColor = color;
}