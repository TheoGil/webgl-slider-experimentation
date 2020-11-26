varying vec2 vUv;
uniform sampler2D u_scene;

void main() {
  gl_FragColor = texture2D(u_scene, vUv);
}