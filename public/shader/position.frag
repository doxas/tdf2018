/* ----------------------------------------------------------------------------
 * position update shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform sampler2D prevTexture;
uniform sampler2D velocityTexture;
uniform vec2      resolution;
uniform bool      move;
const   float     SPEED = 0.01;
void main(){
    vec2 coord = gl_FragCoord.st / resolution;
    vec4 prevPosition = texture2D(prevTexture, coord);
    vec4 velocity = texture2D(velocityTexture, coord);
    float power = prevPosition.w * 0.99;
    if(move){
        power = 1.0;
    }
    vec3 position = prevPosition.xyz + velocity.xyz * power * SPEED;
    if(length(position) > 2.0){
        position = normalize(position);
    }
    gl_FragColor = vec4(position, power);
}
