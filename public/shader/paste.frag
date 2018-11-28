/* ----------------------------------------------------------------------------
 * paste shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2      resolution;
uniform vec2      mouse;
uniform float     globalTime;
uniform sampler2D imageTexture;
uniform sampler2D sceneTexture;
uniform sampler2D graphTexture;

varying vec2 vTexCoord;

const   float PI  = 3.1415926;
const   float PI2 = PI * 2.0;
const   float MOSAIC = 1.0;

void main(){
    float time = globalTime * 2.0;

    // lowres image
    vec4 textureColor = texture2D(imageTexture, vTexCoord);

    // scene
    vec4 sceneColor = texture2D(sceneTexture, vTexCoord);

    // graph
    vec4 graphColor = texture2D(graphTexture, vTexCoord);

    // mosaic
    float mosaic = MOSAIC + sin(time) * (MOSAIC * 0.5);
    mosaic = MOSAIC;
    vec2 signp = gl_FragCoord.st - resolution * 0.5;
    vec2 mosaicCoord = (floor(signp / mosaic) * mosaic) / resolution + 0.5;
    vec4 mosaicColor = texture2D(sceneTexture, mosaicCoord);

    // dest
    vec4 destColor = graphColor;

    gl_FragColor = destColor;
}
