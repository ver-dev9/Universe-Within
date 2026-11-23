/**
 * Chapter 08 — screen-space Schwarzschild ray tracer.
 *
 * Units: Schwarzschild radius R_s = 1 (horizon at r = 1, photon sphere at 1.5,
 * innermost stable circular orbit at 3). Each pixel's ray is traced backwards
 * from the camera with the photon equation of motion written as a Newtonian-
 * looking central force,  a = -1.5 · h² · x / r⁵  (h = |x × v|, conserved),
 * which reproduces the null-geodesic orbit shape r(φ) of the Schwarzschild
 * metric. Every crossing of the y = 0 plane between the disk radii samples a
 * thin accretion disk, so the lensed far side (above/below the shadow) and the
 * higher-order photon-ring images fall out of the integration naturally.
 *
 * Disk shading is an approximation: Novikov–Thorne-like temperature profile,
 * special-relativistic Doppler factor from Keplerian orbital speed, and the
 * gravitational redshift √(1 − 1/r). Rays that escape sample a procedural
 * starfield in their final direction, so the background is lensed too.
 *
 * Step budget comes from `MAX_STEPS` / `STEP_SCALE` defines set per quality tier.
 */
export const blackHoleRaymarchVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const blackHoleRaymarchFragment = /* glsl */ `
  precision highp float;

  #ifndef MAX_STEPS
  #define MAX_STEPS 160
  #endif
  #ifndef STEP_SCALE
  #define STEP_SCALE 0.085
  #endif

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uCamRight;
  uniform vec3 uCamUp;
  uniform vec3 uCamForward;
  uniform float uTanHalfFov;
  uniform vec2 uCenterOffset;   // shifts the hole on screen (NDC-ish units of the short side)
  uniform float uDiskInner;     // R_s units
  uniform float uDiskOuter;
  uniform float uExposure;
  uniform float uDiskGain;
  uniform float uStarGain;
  uniform float uFade;          // 0..1 overall fade-in

  varying vec2 vUv;

  // ---------------------------------------------------------------- noise
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash13(i);
    float n100 = hash13(i + vec3(1, 0, 0));
    float n010 = hash13(i + vec3(0, 1, 0));
    float n110 = hash13(i + vec3(1, 1, 0));
    float n001 = hash13(i + vec3(0, 0, 1));
    float n101 = hash13(i + vec3(1, 0, 1));
    float n011 = hash13(i + vec3(0, 1, 1));
    float n111 = hash13(i + vec3(1, 1, 1));
    return mix(
      mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
      mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.07; a *= 0.5; }
    return s;
  }

  // ------------------------------------------------- black-body (approx.)
  // Normalised colour for a temperature in kelvin (fit after T. Helland).
  vec3 blackbody(float t) {
    t = clamp(t, 1000.0, 40000.0) / 100.0;
    vec3 c;
    c.r = t <= 66.0 ? 1.0 : clamp(1.2929 * pow(t - 60.0, -0.1332), 0.0, 1.0);
    c.g = t <= 66.0 ? clamp(0.3901 * log(t) - 0.6318, 0.0, 1.0)
                    : clamp(1.1299 * pow(t - 60.0, -0.0755), 0.0, 1.0);
    c.b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.5432 * log(t - 10.0) - 1.1963, 0.0, 1.0));
    return c * c; // to roughly linear
  }

  // ------------------------------------------------------------ starfield
  vec3 starLayer(vec3 d, float scale, float density, float size) {
    vec3 p = d * scale;
    vec3 id = floor(p);
    vec3 f = fract(p) - 0.5;
    float h = hash13(id + 17.0);
    if (h > density) return vec3(0.0);
    vec3 o = (hash33(id) - 0.5) * 0.55;
    float dist = length(f - o);
    float tint = hash13(id + 3.1);
    vec3 col = mix(vec3(1.0, 0.78, 0.55), vec3(0.65, 0.8, 1.0), tint);
    float mag = pow(hash13(id + 9.7), 6.0) * 3.0 + 0.25;
    return col * mag * smoothstep(size, 0.0, dist);
  }
  vec3 background(vec3 d) {
    vec3 c = vec3(0.0);
    c += starLayer(d, 70.0, 0.08, 0.16);
    c += starLayer(d, 160.0, 0.12, 0.2) * 0.6;
    c += starLayer(d, 340.0, 0.18, 0.24) * 0.35;
    // a faint galactic band on a tilted great circle + violet/blue nebulosity
    vec3 n = normalize(vec3(0.25, 1.0, 0.35));
    float band = exp(-pow(dot(d, n) * 3.2, 2.0));
    float neb = fbm(d * 3.5 + 4.0);
    c += band * (0.025 + 0.05 * neb) * vec3(0.55, 0.6, 0.9);
    c += pow(neb, 3.0) * 0.06 * vec3(0.54, 0.36, 0.79);
    return c * uStarGain;
  }

  // ------------------------------------------------------------------ disk
  // Returns premultiplied emission (rgb) and opacity (a) for a disk crossing.
  vec4 diskSample(vec3 p, vec3 rayDir) {
    float r = length(p.xz);
    if (r < uDiskInner || r > uDiskOuter) return vec4(0.0);

    // Temperature profile (Novikov–Thorne-like shape), peaks just outside ISCO.
    float x = uDiskInner / r;
    float prof = pow(x, 0.75) * pow(max(1.0 - sqrt(x), 0.0), 0.25);
    prof /= 0.488; // normalise peak ≈ 1

    // Keplerian orbit (counter-clockwise seen from +y). Speed as measured by a
    // static observer: β = sqrt(M / (r − 2M)) with M = 0.5.
    float beta = min(sqrt(0.5 / max(r - 1.0, 0.05)), 0.8);
    vec3 vdir = normalize(vec3(-p.z, 0.0, p.x));
    float cosT = dot(vdir, -rayDir);          // photon travels toward the camera
    float gamma = inversesqrt(1.0 - beta * beta);
    float D = 1.0 / (gamma * (1.0 - beta * cosT));
    float g = D * sqrt(max(1.0 - 1.0 / r, 0.0)); // Doppler × gravitational shift

    // Turbulent, differentially rotating gas.
    float omega = 2.2 * pow(r, -1.5);
    float a = -uTime * omega;
    vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
    float n = fbm(vec3(q * 0.9, r * 2.6));
    float streak = 0.55 + 0.9 * n * n;
    float ringNoise = 0.9 + 0.1 * sin(r * 5.0 + n * 7.0);

    float temp = 4600.0 * pow(prof, 0.6) * g;
    vec3 col = blackbody(temp);
    float intensity = prof * pow(g, 3.5) * streak * ringNoise;

    float edge = smoothstep(uDiskInner, uDiskInner + 0.35, r) * (1.0 - smoothstep(uDiskOuter * 0.6, uDiskOuter, r));
    float opacity = clamp(edge * (0.35 + 0.65 * prof) * (0.55 + 0.6 * n), 0.0, 0.95);
    return vec4(col * intensity * uDiskGain * edge, opacity);
  }

  // ----------------------------------------------------------------- main
  void main() {
    float shortSide = min(uResolution.x, uResolution.y);
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / shortSide * 2.0 - uCenterOffset;

    vec3 dir = normalize(uCamForward + uv.x * uTanHalfFov * uCamRight + uv.y * uTanHalfFov * uCamUp);
    vec3 pos = uCamPos;
    vec3 vel = dir;
    vec3 hv = cross(pos, vel);
    float h2 = dot(hv, hv);

    vec3 col = vec3(0.0);
    float alpha = 0.0;
    bool captured = false;

    for (int i = 0; i < MAX_STEPS; i++) {
      float r2 = dot(pos, pos);
      float r = sqrt(r2);
      float dt = clamp(STEP_SCALE * r * min(1.0, (r - 0.9) * 1.6), 0.012, 2.5);
      vec3 acc = -1.5 * h2 * pos / (r2 * r2 * r);
      vec3 prev = pos;
      vel += acc * dt;
      pos += vel * dt;

      if (prev.y * pos.y < 0.0) {
        float t = prev.y / (prev.y - pos.y);
        vec3 hit = mix(prev, pos, t);
        vec4 d = diskSample(hit, normalize(vel));
        col += (1.0 - alpha) * d.rgb;
        alpha += (1.0 - alpha) * d.a;
        if (alpha > 0.985) break;
      }
      if (dot(pos, pos) < 1.0) { captured = true; break; }
      if (r > 70.0 && dot(pos, vel) > 0.0) break;
    }

    if (!captured && alpha < 0.985) {
      col += (1.0 - alpha) * background(normalize(vel));
    }

    // Filmic tone map (ACES approximation), output linear for three's colour pipeline.
    col *= uExposure;
    col = clamp((col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14), 0.0, 1.0);
    col *= uFade;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;
