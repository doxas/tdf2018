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
    its v; v.len = 0.0, v.col = vec3(0.0);
    float as = abs(sin(time * 5.0) * 0.02);

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
    circle    (p - vec2(0.0, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    circle    (p - vec2(0.1, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);
    circle    (p - vec2(-0.1, 0.25), vec2(1.0, 1.0), 0.02, PIH, WHITE, v);


    gl_FragColor = vec4(v.col, 1.0);
    gl_FragColor = vec4(1.0);
}



















