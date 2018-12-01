/* ----------------------------------------------------------------------------
 * graph shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2  resolution;     // resolution (width, height)
uniform float time;           // time       (1second == 1.0)
uniform int   scene;

const float EPS = 0.001;
const float PI = 3.1415926;
const float PI2 = PI * 2.0;
const float PIH = PI * 0.5;

struct its {
    float len;
    vec3  col;
};

vec3 hsv(float h, float s, float v){
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

float rnd(vec2 p){
    return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453123);
}

float srnd(vec2 p){
    return rnd(p) * 2.0 - 1.0;
}

vec2 rotate(vec2 p, float angle){
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, s, -s, c) * p;
}

void circle(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
    vec2 v = rotate(p, angle) / q;
    float len = length(v) - s;
    if(len < EPS){i.col = color;}
}

void triangle(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
    vec2 v = rotate(p, angle) / q / s;
    float len = v.y + abs(v.x) + (abs(v.y) < 1.0 ? 0.0 : 10.0);
    if(len < EPS){i.col = color;}
}

void wavetriangle(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
    vec2 w = vec2(p.x, p.y + sin(abs(p.x) * 25.0 - time * 5.0) * 0.1 * p.y);
    vec2 v = rotate(w, angle) / q / s;
    float len = v.y + abs(v.x) + (abs(v.y) < 1.0 ? 0.0 : 10.0);
    if(len < EPS){i.col = color;}
}

void box(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i, float ro){
    vec2 v = rotate(p, angle) / s;
    float len = length(max(abs(v) - q, 0.0)) - ro;
    if(len < EPS){i.col = color;}
}

void arcbox(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i, float ro, float h){
    vec2 v = rotate(vec2(p.x, p.y + (1.0 - cos(p.x)) * h), angle) / s;
    float len = length(max(abs(v) - q, 0.0)) - ro;
    if(len < EPS){i.col = color;}
}

void arcbox_m(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i, float ro, float h){
    vec2 v = rotate(vec2(p.x, p.y + (1.0 - cos(p.x)) * h), angle) / s;
    float len = length(max(abs(v) - q, 0.0)) - ro;
    if(len < EPS){
        float l = pow(min(0.2 / abs(sin(v.x * 8.0)), 1.0), 2.0);
        i.col = color + vec3(l * 0.8);
    }
}

void eyecircle(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
    vec2 v = rotate(p, angle) / q;
    vec2 w = vec2(v.x, v.y / sin(abs(1.0 - v.x)));
    float len = length(w) - s;
    if(len < EPS){i.col = color;}
}

void arc(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
    vec2 v = rotate(p, angle) / q;
    vec2 w = vec2(v.x, v.y * 2.0);
    float len = length(v) - s;
    float men = length(w) - s;
    if(len < EPS && men > EPS && v.y > 0.0){i.col = color;}
}

const vec3 WHITE = vec3(0.95, 0.95, 0.95);
const vec3 SILVER = vec3(0.7, 0.7, 0.7);
const vec3 GRAY = vec3(0.4, 0.4, 0.4);
const vec3 BLACK = vec3(0.15, 0.15, 0.15);
const vec3 RED = vec3(0.8, 0.1, 0.0);
const vec3 YELLOW = vec3(0.8, 0.8, 0.0);
const vec3 GREEN = vec3(0.2, 0.7, 0.2);
const vec3 BLUE = vec3(0.2, 0.5, 1.0);
const vec3 NAVY = vec3(0.1, 0.3, 0.7);
const vec3 DARK_RED = vec3(0.5, 0.05, 0.01);

void sunrise(vec2 p, float s, float angle, vec3 color1, vec3 color2, inout its i){
    vec2 v = rotate(p, angle);
    float r = step(sin(atan(v.y, v.x) * s), 0.0);
    i.col = color1 * r + color2 * (1.0 - r);
}

void gradationbox(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i, float ro){
    vec2 v = rotate(p, angle) / s;
    float g = ((v.x + 1.0) * 0.5);
    float len = length(max(abs(v) - q, 0.0)) - ro;
    if(len < EPS){i.col = color * g;}
}

void slash(vec2 p, vec2 q, vec3 color, inout its i){
    float len = abs(p.x / q.x) + abs(p.y / q.y) - 0.5;
    if(len < EPS){i.col = color;}
}

void maguro(vec2 p, inout its v){
    float as = abs(sin(time * 5.0)) - 0.5;
    arc    (p - vec2(0.2, 0.0), vec2(0.3, 0.2), 0.75, -PIH, NAVY, v);
    arc    (p - vec2(-0.1, 0.1), vec2(0.3, 0.2), 0.5, -PIH + 0.5 - as * 0.2, NAVY, v);
    arc    (p - vec2(-0.15, -0.075), vec2(0.3, 0.2), 0.4, -PIH - 0.55 - as * 0.1, NAVY, v);
    eyecircle    (p - vec2(0.0), vec2(1.0, 0.35), 0.5, 0.0, BLUE, v);
    arc    (p - vec2(0.6, 0.0), vec2(0.3, 0.2), 0.75, -PIH + as * 0.2, NAVY, v);
    triangle  (p - vec2(-0.025, 0.0), vec2(0.15, 1.0), 0.2, PIH, NAVY, v);
    arc    (p - vec2(-0.25, 0.0), vec2(0.3, 0.15), 0.25, PIH, NAVY, v);
    circle    (p - vec2(-0.375, 0.025), vec2(1.0, 1.0), 0.05, PIH, WHITE, v);
    circle    (p - vec2(-0.375 + as * 0.025, 0.025), vec2(1.0, 1.0), 0.025, PIH, BLACK, v);
    triangle  (p - vec2(-0.4, -0.03), vec2(0.1, 0.4), 0.2, PIH - 0.25 + as * 0.2, BLACK, v);
}

void sushi(vec2 p, inout its v){
    circle    (p - vec2(0.0), vec2(0.9, 0.9), 0.25, 0.0, GREEN, v);
    circle    (p - vec2(0.0), vec2(0.8, 0.8), 0.25, 0.0, SILVER, v);
    circle    (p - vec2(0.0), vec2(0.7, 0.7), 0.25, 0.0, GREEN, v);
    box       (p - vec2(0.0, -0.02), vec2(0.6, 0.1), 0.125, 0.0, WHITE, v, 0.5);
    arcbox_m   (p - vec2(0.0, 0.05), vec2(0.8, -0.1), 0.15, 0.0, RED, v, 0.5, 3.0);
}

void shuriken(vec2 p, float s, inout its v){
    vec2 tp = rotate(p, time * 5.0 * s);
    triangle  (tp - vec2(0.0, 0.5), vec2(0.25, 1.0), 0.5, 0.0, WHITE, v);
    triangle  (tp - vec2(0.0, -0.5), vec2(0.25, 1.0), 0.5, PI, WHITE, v);
    triangle  (tp - vec2(0.5, 0.0), vec2(0.25, 1.0), 0.5, PIH, WHITE, v);
    triangle  (tp - vec2(-0.5, 0.0), vec2(0.25, 1.0), 0.5, PI + PIH, WHITE, v);
    circle    (p - vec2(0.0), vec2(1.0), 0.2, 0.0, GRAY, v);
    circle    (p - vec2(0.0), vec2(1.0), 0.16, 0.0, SILVER, v);
    circle    (p - vec2(0.0), vec2(1.0), 0.06, 0.0, WHITE, v);
}

void shoumenninja(vec2 p, inout its v){
    float as = abs(sin(time * 5.0) * 0.02);
    // maf
    wavetriangle (p - vec2(0.1, 0.2), vec2(0.2, 1.0), 0.65, -PI - 0.3, YELLOW, v);
    // legs
    for(int i = 0; i < 4; ++i){
        float st = float(i) / 4.0;
        float lt = mod(time * 3.0 + PIH * st, PIH) - PIH * 0.5;
        float ls = sin(-lt - PIH) * 0.255;
        float lc = cos(-lt - PIH) * 0.225;
        box       (p - vec2(0.0, -0.025), vec2(0.05, 1.0), 0.2, lt, DARK_RED, v, 0.01);
        circle    (p - vec2(lc, ls - 0.025), vec2(1.0), 0.03, 0.0, RED, v);
    }
    // arms
    circle    (p - vec2(0.2, 0.0 + as), vec2(0.9, 0.5), 0.1, 1.0, RED, v);
    circle    (p - vec2(-0.2, 0.05 + as), vec2(0.9, 0.5), 0.1, 0.5, RED, v);
    // body
    box       (p - vec2(0.0, as * 0.25), vec2(0.8, 0.8), 0.085, 0.0, DARK_RED, v, 1.2);
    // arms
    circle    (p - vec2(0.175, -0.05 + as), vec2(0.9, 0.5), 0.1, 0.2, RED, v);
    circle    (p - vec2(-0.275, 0.025 + as), vec2(0.9, 0.5), 0.1, 2.0, RED, v);
    // head
    p.y -= as * 0.4;
    circle    (p - vec2(0.0, 0.2), vec2(0.9, 0.95), 0.25, 0.0, RED, v);
    triangle  (p - vec2(0.2, 0.5), vec2(0.575, 1.0), 0.25, PIH * 0.5, RED, v);
    box       (p - vec2(0.0, 0.15), vec2(0.8, 0.2), 0.2, 0.0, WHITE, v, 0.2);
    circle    (p - vec2(0.08, 0.155), vec2(0.5, 1.0), 0.0525, 0.0, BLACK, v);
    circle    (p - vec2(-0.08, 0.155), vec2(0.5, 1.0), 0.0525, 0.0, BLACK, v);
    box       (p - vec2(0.0, 0.25), vec2(0.95, 0.25), 0.2, 0.0, SILVER, v, 0.1);
    box       (p - vec2(0.0, 0.25), vec2(1.0, 0.225), 0.17, 0.0, GRAY, v, 0.1);
    circle    (p - vec2(0.0, 0.24), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    circle    (p - vec2(0.1, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    circle    (p - vec2(-0.1, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
}

void nanameninja(vec2 p, inout its v){
    float as = abs(sin(time * 5.0) * 0.02);
    // legs
    vec2 lp = rotate(p, -0.25);
    for(int i = 0; i < 4; ++i){
        float st = float(i) / 4.0;
        float lt = mod(-time * 3.0 + PIH * st, PIH) - PIH * 0.5;
        float ls = sin(-lt - PIH) * 0.255;
        float lc = cos(-lt - PIH) * 0.225;
        box       (lp - vec2(0.12, -0.075), vec2(0.05, 1.0), 0.2, lt, DARK_RED, v, 0.01);
        circle    (lp - vec2(lc + 0.12, ls - 0.025), vec2(1.0), 0.03, 0.0, RED, v);
    }
    // arms
    circle    (p - vec2(-0.12, -0.05 + as), vec2(0.9, 0.5), 0.1, -0.25, RED, v);
    // body
    box       (p - vec2(0.1, as * 0.25), vec2(0.8, 0.8), 0.085, -0.15, DARK_RED, v, 1.2);
    // maf
    wavetriangle (p - vec2(0.1, 0.1), vec2(0.2, 1.0), 0.65, -PIH - 0.25, YELLOW, v);
    // arms
    circle    (p - vec2(0.24, -0.02 + as), vec2(0.9, 0.5), 0.1, 1.0, RED, v);
    circle    (p - vec2(0.21, -0.075 + as), vec2(0.9, 0.5), 0.1, 0.2, RED, v);
    circle    (p - vec2(-0.185, -0.11 + as), vec2(0.9, 0.5), 0.1, -1.3, RED, v);

    // head
    p.y -= as * 0.4;
    circle    (p - vec2(0.0, 0.2), vec2(0.9, 0.95), 0.25, 0.0, RED, v);
    triangle  (p - vec2(0.2, 0.5), vec2(0.575, 1.0), 0.25, PIH * 0.5, RED, v);
    box       (p - vec2(-0.1, 0.15), vec2(0.4, 0.2), 0.2, 0.0, WHITE, v, 0.2);
    circle    (p - vec2(-0.075, 0.155), vec2(0.5, 1.0), 0.0525, 0.0, BLACK, v);
    circle    (p - vec2(-0.185, 0.155), vec2(0.25, 1.0), 0.0525, 0.0, BLACK, v);
    circle    (p - vec2(-0.25, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    box       (p - vec2(-0.1, 0.25), vec2(0.65, 0.25), 0.2, 0.0, SILVER, v, 0.1);
    box       (p - vec2(-0.125, 0.25), vec2(0.65, 0.225), 0.17, 0.0, GRAY, v, 0.1);
    circle    (p - vec2(-0.1, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    circle    (p - vec2(-0.19, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
}

void scene0(vec2 p, inout its v){
    sunrise(p - vec2(0.0), 10.0, time, RED, YELLOW, v);
    for(int i = 0; i < 5; ++i){
        float o = float(i) / 5.0;
        vec3 h = hsv(o, 1.0, 1.0);
        gradationbox(-p - vec2(0.0 - sin(time + o) * 2.0, o * 2.0 - 0.8), vec2(2.0, 0.2), 1.0, 0.0, h, v, 0.0);
    }
    shoumenninja(p, v);
    nanameninja(p, v);
    shuriken(p - vec2(-0.5, 0.0), 1.0, v);
    sushi(p - vec2(0.5, 0.0), v);
    maguro(p, v);
    slash(p, vec2(0.1, 1.0), GREEN, v);
}

void scene1(vec2 p, inout its v){
    vec2 q = vec2(p.x, mod(p.y + time * 0.3 + 6.0, 4.0) - 2.0);
    if(time > 6.5 && time < 14.0){
        shoumenninja(q, v);
    }
    if(time > 13.5){
        float t = time - 13.5;
        for(int i = 0; i < 5; ++i){
            float f = float(i) * 0.2;
            float x = max(3.0 - t * 5.0 + f, -2.0);
            vec2 r = vec2(x, 0.0);
            vec3 h = hsv(f, 1.0, 1.0);
            gradationbox(-p + vec2(x, f * 2.0 - 0.8), vec2(2.0, 0.2), 1.0, 0.0, h, v, 0.0);
        }
        for(int i = 0; i < 5; ++i){
            float f = float(i) * 0.2;
            float x = max(1.0 - t * 5.0 + f, -2.0);
            vec2 r = vec2(x, f * 2.0 - 0.8);
            shuriken(p - r, float(i + 1), v);
        }
    }
}

void scene2(vec2 p, inout its v){
    float s = floor((time * 2.0) / 1.0) * 1.0;
    float t = floor(time / 0.5) * 0.5;
    float n = srnd(vec2(s)) * 0.5;
    float o = srnd(vec2(t)) * 0.5;
    vec2 q = p + vec2(n, o);
    shoumenninja(q, v);
}

void scene3(vec2 p, inout its v){
    float t = floor(time / 0.5) * 0.5;
    float n = srnd(vec2(t));
    vec2 q = mod(p * (3.0 + n), 2.0) - 1.0;
    shoumenninja(q * 0.9, v);
}

void scene4(vec2 p, inout its v){
    float s = floor((time * 2.0) / 1.0) * 1.0;
    float t = floor(time / 0.5) * 0.5;
    float n = srnd(vec2(t));
    float o = srnd(vec2(t));
    vec2 r = rotate(p, o * PI2);
    vec2 q = mod(r * (7.0 + n * 5.0), 2.0) - 1.0;
    shoumenninja(q * 0.9, v);
}

void scene5(vec2 p, inout its v){
    vec2 q = vec2(
        p.x - max(2.0 - (time - 29.0) * 0.35, -2.0) - abs(sin(time * 5.0)) * 0.1,
        p.y
    );
    if(time < 36.0){
        nanameninja(q, v);
    }
    if(time > 35.5){
        float t = time - 35.5;
        for(int i = 0; i < 5; ++i){
            float f = float(i) * 0.2;
            float x = max(3.0 - t * 5.0 + f, -2.0);
            vec2 r = vec2(x, 0.0);
            vec3 h = hsv(f, 1.0, 1.0);
            gradationbox(-p + vec2(x, f * 2.0 - 0.8), vec2(2.0, 0.2), 1.0, 0.0, h, v, 0.0);
        }
        for(int i = 0; i < 5; ++i){
            float f = float(i) * 0.2;
            float x = max(1.0 - t * 5.0 + f, -2.0);
            vec2 r = vec2(x, f * 2.0 - 0.8);
            shuriken(p - r, float(i + 1), v);
        }
    }
}

void main(){
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    p = vec2(p.x, -p.y);
    its v; v.len = 0.0, v.col = vec3(0.0);

    if(scene == 1){
        scene1(p, v);
    }else if(scene == 2){
        scene2(p, v);
    }else if(scene == 3){
        scene3(p, v);
    }else if(scene == 4){
        scene4(p, v);
    }else if(scene == 5){
        scene5(p, v);
    }else{
        scene0(p, v);
    }

    gl_FragColor = vec4(v.col, 1.0);
}



















