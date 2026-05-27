"use client";

import { useEffect, useRef, memo } from "react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";

// Render at 40% resolution — aurora blurs beautifully at any res
const RENDER_SCALE = 0.4;
// 30 fps cap — plenty smooth for ambient background WebGL
const FRAME_MS = 1000 / 30;

export interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
}

// ── Shaders ───────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec3 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`;

// Simplex noise + 3 unrolled aurora bands (avoids loop/array issues in GLSL 1.0)
const FRAG = /* glsl */ `
precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform float uAmplitude;
uniform float uBlend;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0),
                           dot(x12.xy, x12.xy),
                           dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz  + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float t = uTime;
  float amp = uAmplitude;

  // Band 0
  float w0 = sin(uv.x * 2.8 + t * 0.55) * amp * 0.11
           + snoise(vec2(uv.x * 2.1, t * 0.14)) * amp * 0.07;
  float g0 = exp(-abs(uv.y - 0.28 - w0) * abs(uv.y - 0.28 - w0) * 28.0);

  // Band 1
  float w1 = sin(uv.x * 2.4 + t * 0.78 + 2.1) * amp * 0.13
           + snoise(vec2(uv.x * 1.9 + 3.7, t * 0.18)) * amp * 0.08;
  float g1 = exp(-abs(uv.y - 0.52 - w1) * abs(uv.y - 0.52 - w1) * 26.0);

  // Band 2
  float w2 = sin(uv.x * 3.1 + t * 0.62 + 4.2) * amp * 0.10
           + snoise(vec2(uv.x * 2.3 + 7.4, t * 0.12)) * amp * 0.06;
  float g2 = exp(-abs(uv.y - 0.72 - w2) * abs(uv.y - 0.72 - w2) * 32.0);

  vec3  col   = uColor0 * g0 + uColor1 * g1 + uColor2 * g2;
  float total = g0 + g1 + g2;
  float alpha = clamp(total * uBlend, 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}`;

// ── Component ─────────────────────────────────────────────────────────────────

const Aurora = memo(function Aurora({
  colorStops = ["#F97316", "#F97316", "#EF4444"],
  amplitude  = 1.0,
  blend      = 0.58,
  speed      = 0.5,
}: AuroraProps) {
  const ctnRef   = useRef<HTMLDivElement>(null);
  // Keep latest props accessible inside the rAF loop without re-running the effect
  const propsRef = useRef({ colorStops, amplitude, blend, speed });
  propsRef.current = { colorStops, amplitude, blend, speed };

  useEffect(() => {
    const ctn = ctnRef.current;
    if (!ctn) return;

    // Color cache — avoids allocating Color objects on every frame
    const colorCache = { key: "", v: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] as number[][] };
    const getColors = (stops: string[]) => {
      const key = stops.join(",");
      if (key !== colorCache.key) {
        colorCache.key = key;
        colorCache.v   = stops.slice(0, 3).map(h => {
          const c = new Color(h);
          return [c[0], c[1], c[2]];
        });
        // Pad to 3 entries if fewer stops given
        while (colorCache.v.length < 3) colorCache.v.push(colorCache.v[colorCache.v.length - 1]);
      }
      return colorCache.v;
    };

    // Renderer setup
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, antialias: false });
    const gl       = renderer.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    ctn.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program  = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime:       { value: 0 },
        uResolution: { value: [1, 1] },
        uColor0:     { value: [1, 0.45, 0.09] },
        uColor1:     { value: [1, 0.45, 0.09] },
        uColor2:     { value: [0.94, 0.27, 0.27] },
        uAmplitude:  { value: amplitude },
        uBlend:      { value: blend },
      },
      transparent: true,
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w  = Math.max(1, ctn.offsetWidth);
      const h  = Math.max(1, ctn.offsetHeight);
      const rw = Math.floor(w * RENDER_SCALE);
      const rh = Math.floor(h * RENDER_SCALE);
      renderer.setSize(rw, rh);
      // Stretch low-res canvas to fill container — aurora blurs look fine at 0.4x
      gl.canvas.style.width  = "100%";
      gl.canvas.style.height = "100%";
      program.uniforms.uResolution.value = [rw, rh];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(ctn);
    resize();

    // rAF loop with 30fps cap
    let animId: number;
    let lastT = 0;

    const tick = (t: number) => {
      animId = requestAnimationFrame(tick);
      if (t - lastT < FRAME_MS) return;
      lastT = t;

      const { speed: sp, amplitude: amp, blend: bl, colorStops: cs } = propsRef.current;
      const cols = getColors(cs);

      program.uniforms.uTime.value      = t * 0.001 * sp * 0.1;
      program.uniforms.uAmplitude.value = amp;
      program.uniforms.uBlend.value     = bl;
      program.uniforms.uColor0.value    = cols[0];
      program.uniforms.uColor1.value    = cols[1];
      program.uniforms.uColor2.value    = cols[2];

      renderer.render({ scene: mesh });
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      if (ctn.contains(gl.canvas)) ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []); // stable — propsRef.current absorbs prop changes without re-mounting

  return (
    <div
      ref={ctnRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
});

Aurora.displayName = "Aurora";
export default Aurora;
