/* ----------------------------------------------------------------------------
 * lowres shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform sampler2D imageTexture;
varying vec2 vTexCoord;
void main(){
    vec4 textureColor = texture2D(imageTexture, vec2(vTexCoord.s, 1.0 - vTexCoord.t));
    float lowres = dot(textureColor.rgb, vec3(0.34));
    vec2 res = vec2(0.525, 0.675);
    lowres = lowres < res.x ? res.x * 0.75 : lowres < res.y ? res.y : 1.0;
    gl_FragColor = vec4(vec3(lowres), 1.0);
}
