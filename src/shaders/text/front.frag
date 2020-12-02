varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec3 u_color;

void main() {
    vec4 texel = texture2D(u_texture, vUv);
    vec3 color = vec3(texel.rgb * u_color);
    gl_FragColor = vec4(color, texel.r);
}