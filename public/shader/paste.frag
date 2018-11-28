/* ----------------------------------------------------------------------------
 * paste shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2      resolution;
uniform float     globalTime;
uniform sampler2D texture;

varying vec2 vTexCoord;

const   float PI  = 3.1415926;
const   float PI2 = PI * 2.0;
const   float MOSAIC = 50.0;

void main(){
    float time = globalTime * 2.0;
    float mosaic = MOSAIC + sin(time) * (MOSAIC * 0.5);
    vec2 signp = gl_FragCoord.st - resolution * 0.5;
    vec2 mosaicCoord = (floor(signp / mosaic) * mosaic) / resolution + 0.5;
    vec4 samplerColor = texture2D(texture, mosaicCoord);
    vec4 textureColor = texture2D(texture, vTexCoord);
    gl_FragColor = samplerColor + textureColor;
}
