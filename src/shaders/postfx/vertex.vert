varying vec2 vUv;
uniform float u_distortionAmount;

void main() {
  vUv = uv;

  vec3 pos = position;
  float d = 1. - distance(vUv, vec2(.5)) / .5;
  pos.z = 1. + d * u_distortionAmount;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); 
}