/* ----------------------------------------------------------------------------
 * paste shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2      resolution;
uniform sampler2D texture;
varying vec2 vTexCoord;
const   float PI  = 3.1415926;
const   float PI2 = PI * 2.0;
void main(){
    vec2 p = gl_FragCoord.st / resolution;
    vec4 samplerColor = texture2D(texture, vTexCoord);
    gl_FragColor = samplerColor;
}
