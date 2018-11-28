/* ----------------------------------------------------------------------------
 * graph shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2  resolution;
uniform float time;

varying vec2 vTexCoord;

const int ITR = 64;
const float BLOCK = 1.75;
const float HALFBLOCK = BLOCK * 0.5;
const float EPS = 0.001;
const float PI = 3.1415926;

float sphere(vec3 p, float size){
    float g = pow(sin(p.x * 150.0), 2.0) * 0.005;
    float h = pow(cos(p.z * 50.0), 2.0) * 0.0075;
    return length(p) - size + (g + h);
}

float map(vec3 p){
    float s = sin(p.z);
    float c = cos(p.z);
    mat2 m = mat2(c, s, -s, c);
    p.xy = m * p.xy;
    vec3 q = mod(p, BLOCK) - HALFBLOCK;
    return sphere(q, 1.0);
}

vec3 genNormal(vec3 p){
    float d = 0.001;
    return normalize(vec3(
        map(p + vec3(  d, 0.0, 0.0)) - map(p + vec3( -d, 0.0, 0.0)),
        map(p + vec3(0.0,   d, 0.0)) - map(p + vec3(0.0,  -d, 0.0)),
        map(p + vec3(0.0, 0.0,   d)) - map(p + vec3(0.0, 0.0,  -d))
    ));
}

vec3 march(){
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 v = normalize(vec3(p, -1.0));
    vec3 o = vec3(0.0, 0.0, -time * 0.25);
    float d = 0.0;
    float it = 0.0;
    for(int i = 0; i < ITR; ++i){
        d = map(o);
        o += d * v;
        if(d < EPS){
            it = 1.0 - float(i) / float(ITR);
            break;
        }
    }
    float f = 0.0;
    if(d < EPS){
        vec3 n = genNormal(o);
        f = (dot(n, normalize(vec3(0.5))) + 1.0) * 0.5;
    }
    return vec3(f * it) * abs(v.yzx) * 2.5 + vec3(p, 1.0) * 0.25;
}

void main(){
    vec3 dest = march();
    gl_FragColor = vec4(dest, 1.0);
}

