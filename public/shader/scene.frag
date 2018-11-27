/* ----------------------------------------------------------------------------
 * scene shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec4 globalColor;
varying float vAlpha;
void main(){
    gl_FragColor = globalColor * vec4(vec3(1.0), vAlpha);
}
