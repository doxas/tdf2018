precision mediump float;
uniform vec2  resolution;     // resolution (width, height)
uniform vec2  mouse;          // mouse      (0.0 ~ 1.0)
uniform float time;           // time       (1second == 1.0)
uniform sampler2D backbuffer; // previous scene texture

const float EPS = 0.001;
const float PI = 3.1415926;
const float PI2 = PI * 2.0;
const float PIH = PI * 0.5;

struct its {
	float len;
	vec3  col;
};

vec2 rotate(vec2 p, float angle){
	float s = sin(angle);
	float c = cos(angle);
	return mat2(c, s, -s, c) * p;
}

void circle(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
	vec2 v = rotate(p / q, angle);
	float len = length(v) - s;
	if(len < EPS){i.col = color;}
}

void triangle(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
	vec2 v = rotate(p, angle) / q / s;
	float len = v.y + abs(v.x) + (abs(v.y) < 1.0 ? 0.0 : 10.0);
	if(len < EPS){i.col = color;}
}

void box(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i, float ro){
	vec2 v = rotate(p, angle) / s;
	float len = length(max(abs(v) - q, 0.0)) - ro;
	if(len < EPS){i.col = color;}
}

const vec3 WHITE = vec3(0.95, 0.95, 0.95);
const vec3 SILVER = vec3(0.7, 0.7, 0.7);
const vec3 GRAY = vec3(0.4, 0.4, 0.4);
const vec3 BLACK = vec3(0.15, 0.15, 0.15);
const vec3 RED = vec3(0.8, 0.1, 0.0);

void main(){
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    its v; v.len = 0.0, v.col = vec3(0.0);
    circle    (p - vec2(0.0, 0.2), vec2(0.9, 0.95), 0.25, PIH, RED, v);
    triangle  (p - vec2(0.2, 0.5), vec2(0.575, 1.0), 0.25, PIH * 0.5, RED, v);
    box       (p - vec2(0.0, 0.15), vec2(0.8, 0.2), 0.2, 0.0, WHITE, v, 0.2);
    circle    (p - vec2(0.08, 0.155), vec2(0.5, 1.0), 0.0525, PIH, BLACK, v);
    circle    (p - vec2(-0.08, 0.155), vec2(0.5, 1.0), 0.0525, PIH, BLACK, v);
    box       (p - vec2(0.0, 0.25), vec2(0.95, 0.25), 0.2, 0.0, SILVER, v, 0.1);
    box       (p - vec2(0.0, 0.25), vec2(1.0, 0.225), 0.17, 0.0, GRAY, v, 0.1);
    circle    (p - vec2(0.0, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    circle    (p - vec2(0.1, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    circle    (p - vec2(-0.1, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    gl_FragColor = vec4(v.col, 1.0);
}



















