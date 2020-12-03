varying vec2 vUv;
varying vec2 vScreenUv;
uniform float u_invertion;
uniform sampler2D u_texture;
uniform sampler2D u_mask;
uniform vec3 u_color;

void main() {
    vec4 texel = texture2D(u_texture, vUv);
    vec3 color = vec3(texel.rgb * u_color);
    vec3 invertedColor = 1. - color;
    float mask = texture2D(u_mask, vScreenUv).a;
    vec3 finalColor = mix(color, invertedColor, u_invertion * mask);
    gl_FragColor = vec4(finalColor, texel.r);
}