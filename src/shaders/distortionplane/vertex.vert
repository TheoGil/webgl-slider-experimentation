varying vec2 vUv;
uniform float u_distortionAmount;

void main() {
    vUv = uv;
    
    vec3 newPosition = position;
    float d = distance(vUv, vec2(.5));
    newPosition.z -= d * u_distortionAmount;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0); 
}