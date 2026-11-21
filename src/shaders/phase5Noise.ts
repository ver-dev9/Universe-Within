/**
 * Shared GLSL chunks for the Phase 5 chapters (stars + nebulae).
 * 3D simplex noise by Ashima Arts / Stefan Gustavson (MIT licence).
 */
export const SIMPLEX_3D = /* glsl */ `
vec3 p5_mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 p5_mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 p5_permute(vec4 x) { return p5_mod289(((x * 34.0) + 1.0) * x); }
vec4 p5_taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = p5_mod289(i);
  vec4 p = p5_permute(p5_permute(p5_permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
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
  vec4 norm = p5_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

/**
 * Approximate blackbody colour (Tanner Helland fit), input kelvin. The fit is in
 * sRGB, so it is converted to linear here (pow 2.2); shaders using it end with
 * <colorspace_fragment> so the renderer / composer encodes it back once.
 */
export const BLACKBODY = /* glsl */ `
vec3 blackbody(float kelvin) {
  float t = clamp(kelvin, 1000.0, 40000.0) / 100.0;
  float r = t <= 66.0 ? 1.0 : clamp(1.292936 * pow(t - 60.0, -0.1332047592), 0.0, 1.0);
  float g = t <= 66.0
    ? clamp(0.39008157 * log(t) - 0.63184144, 0.0, 1.0)
    : clamp(1.129890861 * pow(t - 60.0, -0.0755148492), 0.0, 1.0);
  float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.543206789 * log(t - 10.0) - 1.19625408, 0.0, 1.0));
  return pow(vec3(r, g, b), vec3(2.2));
}
`;

/** Same blackbody fit in JS, for UI swatches (returns CSS rgb()). */
export function blackbodyCss(kelvin: number): string {
  const t = Math.min(40000, Math.max(1000, kelvin)) / 100;
  const c = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255);
  const r = t <= 66 ? 1 : 1.292936 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 0.39008157 * Math.log(t) - 0.63184144 : 1.129890861 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 1 : t <= 19 ? 0 : 0.543206789 * Math.log(t - 10) - 1.19625408;
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}
