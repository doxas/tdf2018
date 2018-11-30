precision mediump float;
uniform vec2  resolution;     // resolution (width, height)
uniform vec2  mouse;          // mouse      (0.0 ~ 1.0)
uniform float time;           // time       (1second == 1.0)
uniform sampler2D backbuffer; // previous scene texture

const float EPS = 0.001;
const float PI = 3.1415926;
const float PI2 = PI * 2.0;
const float PIH = PI * 0.5;
const vec3 COLOR1 = vec3(1.0, 0.0, 0.0);
const vec3 COLOR2 = vec3(1.0, 1.0, 0.0);
const vec3 COLOR3 = vec3(1.0, 0.0, 1.0);

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
	vec2 v = rotate(p, angle);
	float len = step(length(v / q), s);
	if(len > 0.0){i.col = color;}
}

void triangle(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
	vec2 v = rotate(p, angle);
	vec2 r = v / q / s;
	float slope = (r.x + 1.0) * 0.5;
	float len = step(abs(r.x), 1.0) * step(abs(r.y), slope);
	if(len > 0.0){i.col = color;}
}

void trapezoid(vec2 p, vec2 q, float s, float angle, vec3 color, inout its i){
	vec2 v = rotate(p, angle);
	vec2 r = v / q / s;
	float slope = (r.x + 1.0) * 0.5;
	float len = step(abs(r.x), 0.5) * step(abs(r.y), slope);
	if(len > 0.0){i.col = color;}
}

void main(){
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    its v; v.len = 0.0, v.col = vec3(0.0);
    circle(p + vec2(0.0, 0.0), vec2(1.0, 0.5), 0.75, PIH, COLOR1, v);
    triangle(p + vec2(0.0, 0.0), vec2(0.5, 1.0), 0.5, -PIH, COLOR2, v);
    trapezoid(p + vec2(0.0, 0.0), vec2(1.5, 0.5), 0.25, time, COLOR3, v);
    gl_FragColor = vec4(v.col, 1.0);
}
