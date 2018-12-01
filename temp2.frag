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
	vec2 v = rotate(p, angle) / q;
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
const vec3 DARK_RED = vec3(0.5, 0.05, 0.01);

void main(){
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec2 tp = rotate(p, time);
    its v; v.len = 0.0, v.col = vec3(0.0);
    float as = abs(sin(time * 5.0) * 0.02);

	// shuriken
    triangle  (tp - vec2(0.0, 0.325), vec2(0.25, 1.0), 0.25, 0.0, WHITE, v);
    triangle  (tp - vec2(0.0, -0.325), vec2(0.25, 1.0), 0.25, PI, WHITE, v);
    triangle  (tp - vec2(0.325, 0.0), vec2(0.25, 1.0), 0.25, PIH, WHITE, v);
    triangle  (tp - vec2(-0.325, 0.0), vec2(0.25, 1.0), 0.25, PI + PIH, WHITE, v);
    circle    (p - vec2(0.0), vec2(1.0), 0.125, 0.0, GRAY, v);
    circle    (p - vec2(0.0), vec2(1.0), 0.1, 0.0, SILVER, v);

    gl_FragColor = vec4(v.col, 1.0);
    // gl_FragColor = vec4(1.0);
}



















