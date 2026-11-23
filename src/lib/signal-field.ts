const VERTEX = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uPhase;
uniform float uScroll;
uniform float uFlow;
uniform vec3 uPointer;
uniform vec3 uRipples[RIPPLES];
out vec4 outColor;

vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec3 v) {
	const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
	vec3 i = floor(v + dot(v, C.yyy));
	vec3 x0 = v - i + dot(i, C.xxx);
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min(g.xyz, l.zxy);
	vec3 i2 = max(g.xyz, l.zxy);
	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - 0.5;
	i = mod(i, 289.0);
	vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
	vec3 ns = 0.142857142857 * vec3(2.0, 0.5, 1.0) - vec3(0.0, 1.0, 0.0);
	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_);
	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);
	vec4 b0 = vec4(x.xy, y.xy);
	vec4 b1 = vec4(x.zw, y.zw);
	vec4 s0 = floor(b0) * 2.0 + 1.0;
	vec4 s1 = floor(b1) * 2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));
	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
	vec3 p0 = vec3(a0.xy, h.x);
	vec3 p1 = vec3(a0.zw, h.y);
	vec3 p2 = vec3(a1.xy, h.z);
	vec3 p3 = vec3(a1.zw, h.w);
	vec4 norm = inversesqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
	vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
	m = m * m;
	return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
	float unit = min(uRes.x, uRes.y);
	vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / unit;
	vec2 pointer = (uPointer.xy - 0.5 * uRes) / unit;

	vec2 toPointer = uv - pointer;
	float pull = exp(-dot(toPointer, toPointer) * 9.0) * uPointer.z;
	vec2 p = uv - toPointer * pull * 0.55;
	p.y -= uScroll / unit * 0.35;

	float t = uPhase * 0.045;
	float field = snoise(vec3(p * 1.35, t)) + 0.5 * snoise(vec3(p * 2.9 + 7.3, t * 1.6));

	float glow = 0.0;
	for (int i = 0; i < RIPPLES; i++) {
		vec3 r = uRipples[i];
		float age = uTime - r.z;
		if (age < 0.0 || age > 3.0) continue;
		float d = length(uv - (r.xy - 0.5 * uRes) / unit);
		float ring = exp(-pow((d - age * 0.55) * 10.0, 2.0)) * exp(-age * 1.6);
		field += ring * 0.3;
		glow += ring;
	}

	float bands = field * 7.0;
	float line = 1.0 - smoothstep(0.0, 1.25, abs(fract(bands) - 0.5) / fwidth(bands));
	float centerDim = mix(0.4, 0.85, step(uRes.x, uRes.y));
	float edge = mix(centerDim, 1.0, smoothstep(0.18, 0.75, abs(uv.x)));
	float alpha = line * (0.13 + 0.12 * uFlow + 0.22 * pull + 0.6 * glow) * edge;
	outColor = vec4(vec3(1.0), 1.0) * alpha;
}`;

const RIPPLES = 3;
const MAX_PIXEL_RATIO = 1.5;
const LOW_END_PIXEL_RATIO = 0.75;
const SLOW_FRAME_MS = 24;
const FRAME_SAMPLE = 45;
const POINTER_EASE = 0.08;
const SCROLL_EASE = 0.12;
const FLOW_EASE = 0.06;
const FLOW_FULL_PX_PER_FRAME = 30;
const FLOW_SPEEDUP = 6;
const STILL_PHASE = 40;
const MAX_FRAME_SECONDS = 0.05;

export type SignalField = {
	ripple: (clientX: number, clientY: number) => void;
	destroy: () => void;
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed');
	}
	return shader;
}

export function createSignalField(
	canvas: HTMLCanvasElement,
	{ animate, onFirstFrame }: { animate: boolean; onFirstFrame: () => void }
): SignalField | null {
	const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
	if (!gl) return null;

	const program = gl.createProgram()!;
	gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
	gl.attachShader(
		program,
		compile(gl, gl.FRAGMENT_SHADER, FRAGMENT.replace(/RIPPLES/g, String(RIPPLES)))
	);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
	gl.useProgram(program);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const position = gl.getAttribLocation(program, 'a');
	gl.enableVertexAttribArray(position);
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

	const uRes = gl.getUniformLocation(program, 'uRes');
	const uTime = gl.getUniformLocation(program, 'uTime');
	const uPointer = gl.getUniformLocation(program, 'uPointer');
	const uRipples = gl.getUniformLocation(program, 'uRipples');
	const uPhase = gl.getUniformLocation(program, 'uPhase');
	const uScroll = gl.getUniformLocation(program, 'uScroll');
	const uFlow = gl.getUniformLocation(program, 'uFlow');

	const ripples = new Float32Array(RIPPLES * 3).fill(-100);
	let nextRipple = 0;
	let pixelRatio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
	const pointer = { x: 0, y: 0, strength: 0 };
	const target = { x: 0, y: 0, strength: 0 };
	const start = performance.now();
	let frame = 0;
	let raf = 0;
	let lastFrame = start;
	let slowFrames = 0;
	let sampled = 0;
	let phase = STILL_PHASE;
	let flow = 0;
	let lastScroll = scrollY;
	let scroll = scrollY;

	const seconds = () => (performance.now() - start) / 1000;

	function resize() {
		const width = Math.round(canvas.clientWidth * pixelRatio);
		const height = Math.round(canvas.clientHeight * pixelRatio);
		if (canvas.width === width && canvas.height === height) return;
		canvas.width = width;
		canvas.height = height;
		gl!.viewport(0, 0, width, height);
		if (!animate) draw();
	}

	function draw() {
		gl!.uniform2f(uRes, canvas.width, canvas.height);
		gl!.uniform1f(uTime, animate ? seconds() : STILL_PHASE);
		gl!.uniform1f(uPhase, phase);
		gl!.uniform1f(uScroll, (animate ? scroll : scrollY) * pixelRatio);
		gl!.uniform1f(uFlow, flow);
		gl!.uniform3f(
			uPointer,
			pointer.x * pixelRatio,
			canvas.height - pointer.y * pixelRatio,
			pointer.strength
		);
		gl!.uniform3fv(uRipples, ripples);
		gl!.drawArrays(gl!.TRIANGLES, 0, 3);
		if (frame++ === 0) onFirstFrame();
	}

	function adaptResolution(now: number) {
		if (sampled >= FRAME_SAMPLE) return;
		if (now - lastFrame > SLOW_FRAME_MS) slowFrames++;
		if (++sampled === FRAME_SAMPLE && slowFrames > FRAME_SAMPLE / 2) {
			pixelRatio = LOW_END_PIXEL_RATIO;
			resize();
		}
	}

	function tick(now: number) {
		adaptResolution(now);
		const dt = Math.min((now - lastFrame) / 1000, MAX_FRAME_SECONDS);
		lastFrame = now;
		const scrolled = Math.abs(scrollY - lastScroll);
		lastScroll = scrollY;
		scroll += (scrollY - scroll) * SCROLL_EASE;
		flow += (Math.min(scrolled / FLOW_FULL_PX_PER_FRAME, 1) - flow) * FLOW_EASE;
		phase += dt * (1 + flow * FLOW_SPEEDUP);
		pointer.x += (target.x - pointer.x) * POINTER_EASE;
		pointer.y += (target.y - pointer.y) * POINTER_EASE;
		pointer.strength += (target.strength - pointer.strength) * POINTER_EASE;
		draw();
		raf = requestAnimationFrame(tick);
	}

	function play() {
		if (!animate || raf) return;
		lastFrame = performance.now();
		raf = requestAnimationFrame(tick);
	}

	function pause() {
		cancelAnimationFrame(raf);
		raf = 0;
	}

	function onPointerMove(event: PointerEvent) {
		target.x = event.clientX;
		target.y = event.clientY;
		target.strength = 1;
		if (pointer.strength === 0) {
			pointer.x = target.x;
			pointer.y = target.y;
		}
	}

	function ripple(clientX: number, clientY: number) {
		if (!animate) return;
		ripples.set(
			[clientX * pixelRatio, canvas.height - clientY * pixelRatio, seconds()],
			nextRipple * 3
		);
		nextRipple = (nextRipple + 1) % RIPPLES;
	}

	function onPointerDown(event: PointerEvent) {
		ripple(event.clientX, event.clientY);
	}

	function onPointerLeave() {
		target.strength = 0;
	}

	function onVisibility() {
		if (document.hidden) pause();
		else play();
	}

	const observer = new ResizeObserver(resize);
	observer.observe(canvas);
	canvas.addEventListener('webglcontextlost', pause);
	document.addEventListener('visibilitychange', onVisibility);
	if (animate) {
		addEventListener('pointermove', onPointerMove, { passive: true });
		addEventListener('pointerdown', onPointerDown, { passive: true });
		document.documentElement.addEventListener('pointerleave', onPointerLeave);
	}
	resize();
	if (animate) play();
	else draw();

	return {
		ripple,
		destroy() {
			pause();
			observer.disconnect();
			canvas.removeEventListener('webglcontextlost', pause);
			document.removeEventListener('visibilitychange', onVisibility);
			removeEventListener('pointermove', onPointerMove);
			removeEventListener('pointerdown', onPointerDown);
			document.documentElement.removeEventListener('pointerleave', onPointerLeave);
		}
	};
}
