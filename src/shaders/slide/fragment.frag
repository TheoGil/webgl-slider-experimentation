varying vec2 vUv;
uniform float u_distortionAmount;

void main() {
  float d = distance(vUv, vec2(.5));
  vec3 color = 1. - vec3(d);

  gl_FragColor = vec4(color, 1.0);
}