#pragma glslify: backgroundCover = require(../helpers/backgroundCover);
#define PARALLAX 0.15

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_resIn;
uniform vec2 u_resOut;
uniform float u_parallax;

void main() {
  vec2 coords = vUv - vec2(.5);
  coords *= vec2(1. - PARALLAX * 2.);
  coords += vec2(u_parallax * PARALLAX, 0.);
  coords += vec2(.5);

  vec2 uv = backgroundCover(coords, u_resIn, u_resOut);
  gl_FragColor = texture2D(u_texture, uv);
}