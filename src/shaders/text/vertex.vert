varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
    vec4 v = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // Screen position
    // → https://stackoverflow.com/a/19781424/9231802
    vScreenUv = vec2(
        0.5 * (v.x / v.z) + .5,
        0.5 * (v.y / v.z) + .5
    );
    
    vUv = uv;
    gl_Position = v;
}