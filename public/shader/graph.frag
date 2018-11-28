/* ----------------------------------------------------------------------------
 * graph shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2  resolution;
uniform float globalTime;

varying vec2 vTexCoord;

const   float PI  = 3.1415926;
const   float PI2 = PI * 2.0;

void main(){
    float time = globalTime * 2.0;
    vec2 p = (gl_FragCoord.st * 2.0 - resolution) / min(resolution.x, resolution.y);

    vec4 destColor = vec4(vec3(0.1 / length(p)), 1.0);

    gl_FragColor = destColor;
}
