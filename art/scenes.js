// URMPL Demo 04 — original cinematic renders, drawn entirely in code with three.js.
// Each scene is selected with ?scene=<name>&w=<px>&h=<px>. The harness sets window.__done
// once the frame is rendered and graded (vignette + film grain) onto #out.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const params = new URLSearchParams(location.search);
const SCENE = params.get('scene') || 'hero-sea';
const W = +params.get('w') || 1600;
const H = +params.get('h') || 900;
const SS = +params.get('ss') || 1.5; // supersampling factor

// ---------- utilities ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const C = (hex) => new THREE.Color(hex);
const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];
function weighted(r, entries) {
  const total = entries.reduce((s, e) => s + e[1], 0);
  let x = r() * total;
  for (const [v, w] of entries) { if ((x -= w) <= 0) return v; }
  return entries[0][0];
}
function canvasTex(w, h, draw, { repeat = [1, 1], srgb = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(Math.round(W * SS), Math.round(H * SS));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ---------- shared GLSL ----------
const NOISE = /* glsl */`
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float s=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<6;i++){ s+=a*vnoise(p); p=m*p; a*=.5; } return s; }
`;
const SKY_FN = /* glsl */`
uniform vec3 uHorizon; uniform vec3 uZenith; uniform vec3 uSunDir; uniform vec3 uSunColor;
uniform float uCloudCover; uniform float uCloudScale; uniform vec3 uCloudLit; uniform vec3 uCloudDark; uniform float uCloudSeed;
vec3 skyColor(vec3 d, bool clouds){
  float y = max(d.y, 0.0);
  vec3 col = mix(uHorizon, uZenith, pow(y, 0.42));
  float s = max(dot(d, uSunDir), 0.0);
  col += uSunColor * (pow(s, 6.0)*0.28 + pow(s, 60.0)*0.5 + pow(s, 900.0)*6.0);
  if (clouds && d.y > 0.0) {
    vec2 uv = d.xz / (d.y + 0.06) * uCloudScale + uCloudSeed;
    float n = fbm(uv) * 0.75 + fbm(uv*2.7 + 3.1) * 0.35;
    float c = smoothstep(1.0 - uCloudCover, 1.0 - uCloudCover + 0.32, n);
    float lit = clamp(0.35 + 0.9*(fbm(uv*1.3 + uSunDir.xz*0.9) - 0.35) + pow(s, 4.0)*0.6, 0.0, 1.0);
    vec3 cc = mix(uCloudDark, uCloudLit, lit);
    float fade = smoothstep(0.0, 0.05, d.y);
    col = mix(col, cc, c * fade);
  }
  return col;
}
`;

function makeSky(u) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: u,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize((modelMatrix*vec4(position,1.)).xyz - cameraPosition); gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.); }`,
    fragmentShader: `${NOISE}${SKY_FN} varying vec3 vDir; void main(){ vec3 d = normalize(vDir); gl_FragColor = vec4(skyColor(d, true), 1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(9000, 64, 32), mat);
  m.renderOrder = -1;
  return m;
}

function makeOcean(u) {
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `${NOISE}${SKY_FN}
uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFog; uniform float uFogDensity; uniform float uWaveAmp; uniform float uChop;
uniform vec3 uShipPos; uniform vec2 uShipDir; uniform float uShipLen; uniform float uShipBeam; uniform float uWake;
varying vec3 vW;
float H(vec2 p, float detail){
  float h = 0.0;
  h += 0.9*sin(dot(p, vec2(0.021,0.013)) + 1.3);
  h += 0.6*sin(dot(p, vec2(-0.017,0.029)) + 0.2);
  h += 0.35*sin(dot(p, vec2(0.051,-0.037)) + 2.1);
  h += 0.22*sin(dot(p, vec2(-0.071,-0.049)) + 4.0);
  h += uChop * (fbm(p*0.09) - 0.5) * 2.2;
  h += detail * uChop * (fbm(p*0.42 + 7.0) - 0.5) * 0.9;
  h += detail * uChop * (fbm(p*1.7 + 3.0) - 0.5) * 0.25;
  return h * uWaveAmp;
}
vec2 gLoc;
float wakeMask(vec2 p, out float turb){
  vec2 d = p - uShipPos.xz;
  vec2 perp = vec2(-uShipDir.y, uShipDir.x);
  float along = dot(d, uShipDir);
  float side = dot(d, perp);
  float s = -(along + uShipLen*0.5);
  gLoc = vec2(along*0.12, side*0.9);
  float m = 0.0; turb = 0.0;
  if (s > -uShipLen) {
    // hull-side bow wave and spray
    float inHull = smoothstep(-uShipLen*1.0, -uShipLen*0.85, s) * (1.0 - smoothstep(-6.0, 4.0, s));
    float hull = exp(-pow((abs(side) - uShipBeam*0.5 - 2.0)/3.5, 2.0)) * inHull;
    float bow = exp(-pow((abs(side) - uShipBeam*0.35)/5.0, 2.0)) * exp(-pow((s + uShipLen*0.97)/10.0, 2.0));
    m += hull*0.7 + bow*1.2;
  }
  if (s > 0.0) {
    float w = uShipBeam*0.55 + s*0.07;
    float centre = smoothstep(w, w*0.35, abs(side)) * exp(-s/(1100.0*uWake));
    float arm = exp(-pow((abs(side) - (0.33*s + uShipBeam*0.5))/(5.0 + s*0.03), 2.0)) * exp(-s/(700.0*uWake));
    m += centre + arm*0.65;
    turb = smoothstep(w*1.4, w*0.2, abs(side)) * exp(-s/(1500.0*uWake));
  }
  return m;
}
void main(){
  vec2 p = vW.xz;
  float dist = length(cameraPosition - vW);
  float detail = 1.0 - smoothstep(250.0, 1400.0, dist);
  float e = 0.35 + dist*0.0025;
  float turb;
  float wm = wakeMask(p, turb);
  float hx = H(p+vec2(e,0.), detail) - H(p-vec2(e,0.), detail);
  float hz = H(p+vec2(0.,e), detail) - H(p-vec2(0.,e), detail);
  vec3 n = normalize(vec3(-hx/(2.*e), 1.0, -hz/(2.*e)));
  // churned water: extra high-frequency normal noise
  float tn = fbm(p*0.6) - 0.5;
  n = normalize(n + vec3(tn, 0.0, fbm(p*0.6+9.0)-0.5) * turb * 0.9);
  vec3 V = normalize(cameraPosition - vW);
  vec3 R = reflect(-V, n); R.y = abs(R.y);
  float fres = 0.02 + 0.98*pow(1.0 - max(dot(n, V), 0.0), 5.0);
  vec3 refl = skyColor(R, false);
  float h = H(p, detail);
  vec3 water = mix(uDeep, uShallow, clamp(h*0.25 + 0.35, 0.0, 1.0) * 0.6 + turb*0.35);
  water *= 0.55 + 0.45*max(uSunDir.y + 0.4, 0.0);
  vec3 col = mix(water, refl, clamp(fres, 0.0, 1.0));
  float spec = pow(max(dot(R, uSunDir), 0.0), 220.0);
  col += uSunColor * spec * 2.2;
  // foam
  float fn = fbm(gLoc*0.22) * 0.75 + fbm(gLoc*1.1 + p*0.2)*0.55;
  float foam = smoothstep(0.42, 0.9, min(wm, 1.0) * fn * 1.25) * 0.95 + smoothstep(0.2, 0.6, wm*fn)*0.15;
  vec3 foamCol = mix(uHorizon*0.95, vec3(0.92,0.94,0.95), 0.5) * (0.75 + 0.25*max(uSunDir.y*3.0,0.0));
  col = mix(col, foamCol, foam*0.9);
  // atmospheric fog
  float f = 1.0 - exp(-pow(dist*uFogDensity, 1.35));
  vec3 fogc = skyColor(normalize(vec3(-V.x, 0.015, -V.z)), false);
  col = mix(col, mix(fogc, uFog, 0.5), clamp(f, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000, 1, 1), mat);
  m.rotation.x = -Math.PI / 2;
  return m;
}

function skyUniforms(o) {
  return {
    uHorizon: { value: C(o.horizon) }, uZenith: { value: C(o.zenith) },
    uSunDir: { value: o.sunDir.clone().normalize() }, uSunColor: { value: C(o.sunColor).multiplyScalar(o.sunPower ?? 1) },
    uCloudCover: { value: o.cloudCover ?? 0.0 }, uCloudScale: { value: o.cloudScale ?? 1.4 },
    uCloudLit: { value: C(o.cloudLit ?? '#ffffff') }, uCloudDark: { value: C(o.cloudDark ?? '#7d8a96') },
    uCloudSeed: { value: o.cloudSeed ?? 0 },
  };
}

// ---------- ship ----------
const CONTAINER_PALETTES = {
  muted: [['#7c3a2c', 5], ['#2c4660', 4], ['#3a6669', 3], ['#a9a69c', 3], ['#b8682a', 2], ['#5f6234', 1.5], ['#8f2a24', 2], ['#d6d2c6', 1.5], ['#1f2a33', 2], ['#46525c', 2]],
  vivid: [['#c0392b', 3], ['#1e5aa8', 3], ['#2f9a6b', 2], ['#e2a31f', 2], ['#e8e4da', 2], ['#7b3fa0', 0.7], ['#e07b2a', 2], ['#3fa7c9', 2], ['#9a2f1f', 2], ['#5a6b78', 2], ['#d9493a', 1.5]],
};

function corrugation() {
  return canvasTex(256, 64, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const v = 128 + 110 * Math.sin((x / w) * Math.PI * 2 * 24);
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, h);
    }
    g.fillStyle = 'rgb(40,40,40)'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3);
  }, { srgb: false });
}

function hullGeometry(L, B, freeboard, draft) {
  const N = 72; const ring = []; const pos = []; const col = []; const idx = [];
  const prof = (t) => {
    let w = B / 2;
    if (t < 0.06) w *= 0.86 + 0.14 * (t / 0.06);
    if (t > 0.74) w *= Math.max(0.02, 1 - Math.pow((t - 0.74) / 0.26, 1.9));
    let keel = -draft;
    if (t > 0.9) keel = -draft + (draft * 0.75) * Math.pow((t - 0.9) / 0.1, 1.5);
    let deck = freeboard + (t > 0.85 ? (t - 0.85) * 18 : 0);
    return { w, keel, deck };
  };
  const hullC = C(ring.hullColor || '#1a2733');
  const P = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N; const x = -L / 2 + t * L; const { w, keel, deck } = prof(t);
    // section from port deck edge down round to keel and up to starboard deck edge
    const pts = [
      [-w, deck], [-w, 1.2], [-w, -0.6], [-w * 0.97, -draft * 0.55], [-w * 0.78, keel * 0.95], [0, keel],
      [w * 0.78, keel * 0.95], [w * 0.97, -draft * 0.55], [w, -0.6], [w, 1.2], [w, deck],
    ];
    P.push(pts.map(([z, y]) => [x, y, z]));
  }
  const K = P[0].length;
  for (let i = 0; i <= N; i++) for (let k = 0; k < K; k++) { pos.push(...P[i][k]); }
  for (let i = 0; i < N; i++) for (let k = 0; k < K - 1; k++) {
    const a = i * K + k, b = (i + 1) * K + k, c2 = (i + 1) * K + k + 1, d = i * K + k + 1;
    idx.push(a, b, d, b, c2, d);
  }
  // transom
  const base = pos.length / 3; const t0 = P[0];
  pos.push(-L / 2, (t0[0][1] + t0[5][1]) / 2, 0);
  for (let k = 0; k < K; k++) pos.push(...t0[k]);
  for (let k = 0; k < K - 1; k++) idx.push(base, base + 2 + k, base + 1 + k);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return { g, prof };
}

function paintHull(g, hull) {
  const p = g.attributes.position; const cols = [];
  const top = C(hull), boot = C('#14171a'), red = C('#6e2a22'), white = C('#d8d8d2');
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    let c = top;
    if (y < 1.4 && y > -0.2) c = boot; else if (y <= -0.2) c = red;
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
}

function buildShip(o) {
  const r = rng(o.seed || 7);
  const L = o.length || 300, B = o.beam || 48, fb = o.freeboard || 9, dr = 13;
  const group = new THREE.Group();
  const { g, prof } = hullGeometry(L, B, fb, dr);
  paintHull(g, o.hull || '#1b2834');
  const hullMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.25, side: THREE.DoubleSide });
  const hull = new THREE.Mesh(g, hullMat); hull.castShadow = hull.receiveShadow = true; group.add(hull);

  // deck plate
  const deckShape = new THREE.Shape();
  const N = 50;
  for (let i = 0; i <= N; i++) { const t = i / N; const { w } = prof(t); const x = -L / 2 + t * L; i === 0 ? deckShape.moveTo(x, -w) : deckShape.lineTo(x, -w); }
  for (let i = N; i >= 0; i--) { const t = i / N; const { w } = prof(t); deckShape.lineTo(-L / 2 + t * L, w); }
  const deckG = new THREE.ShapeGeometry(deckShape); deckG.rotateX(Math.PI / 2);
  const deck = new THREE.Mesh(deckG, new THREE.MeshStandardMaterial({ color: '#3a3f42', roughness: 0.9, side: THREE.DoubleSide }));
  deck.position.y = fb - 0.1; deck.receiveShadow = true; group.add(deck);

  // containers
  const palette = CONTAINER_PALETTES[o.palette || 'muted'];
  const bump = corrugation();
  const cMat = new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.15, bumpMap: bump, bumpScale: 0.6 });
  const box = new THREE.BoxGeometry(12.2, 2.6, 2.44);
  const bridgeT = o.bridgeT ?? 0.7;
  const placements = [];
  const bayLen = 13.1;
  const rows = Math.floor((B * 0.94) / 2.52);
  const startX = -L / 2 + 0.07 * L, endX = -L / 2 + 0.86 * L;
  const bridgeX = -L / 2 + bridgeT * L;
  for (let x = startX; x < endX; x += bayLen) {
    if (Math.abs(x + 6 - bridgeX) < 13) continue;
    const t = (x - startX) / (endX - startX);
    const { w } = prof((x + L / 2) / L + 0.02);
    const rowsHere = Math.min(rows, Math.floor((w * 2 * 0.94) / 2.52));
    const maxTier = Math.round((o.tiers || 7) * (t > 0.88 ? 0.6 : 1));
    for (let rI = 0; rI < rowsHere; rI++) {
      const z = (rI - (rowsHere - 1) / 2) * 2.52;
      if (r() < (o.empty ?? 0.04)) continue;
      const tiers = Math.max(1, maxTier - Math.floor(r() * r() * 4));
      let colour = weighted(r, palette);
      for (let k = 0; k < tiers; k++) {
        if (r() < 0.55) colour = weighted(r, palette);
        placements.push([x + 6.1, fb + 1.3 + k * 2.62, z, colour]);
      }
    }
  }
  const inst = new THREE.InstancedMesh(box, cMat, placements.length);
  const m4 = new THREE.Matrix4(); const cc = new THREE.Color();
  placements.forEach(([x, y, z, col], i) => {
    m4.makeTranslation(x, y, z); inst.setMatrixAt(i, m4);
    cc.set(col).multiplyScalar(0.82 + r() * 0.3); inst.setColorAt(i, cc);
  });
  inst.castShadow = inst.receiveShadow = true; group.add(inst);

  // superstructure
  const white = new THREE.MeshStandardMaterial({ color: o.houseColor || '#e7e6e0', roughness: 0.55, metalness: 0.1 });
  const dark = new THREE.MeshStandardMaterial({ color: '#0d1418', roughness: 0.25, metalness: 0.6 });
  const levels = o.levels || 10; const lh = 3.0; const hw = 16;
  for (let i = 0; i < levels; i++) {
    const wdt = i === levels - 1 ? B + 3 : hw * (1 - i * 0.03) + 10;
    const box2 = new THREE.Mesh(new THREE.BoxGeometry(12, lh * 0.82, wdt), white);
    box2.position.set(bridgeX, fb + 1.5 + i * lh, 0); box2.castShadow = box2.receiveShadow = true; group.add(box2);
    const win = new THREE.Mesh(new THREE.BoxGeometry(12.15, lh * 0.32, wdt * (i === levels - 1 ? 0.96 : 0.84)), dark);
    win.position.set(bridgeX, fb + 1.6 + i * lh, 0); group.add(win);
  }
  const top = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, B + 4), white); top.position.set(bridgeX, fb + 1.6 + levels * lh - 0.8, 0); top.castShadow = true; group.add(top);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 14, 8), white); mast.position.set(bridgeX, fb + levels * lh + 7, 0); group.add(mast);
  const yard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 10), white); yard.position.set(bridgeX, fb + levels * lh + 11, 0); group.add(yard);
  // funnel & engine casing aft
  const fx = -L / 2 + 0.12 * L;
  const casing = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 14), white); casing.position.set(fx, fb + 8, 0); casing.castShadow = true; group.add(casing);
  const fun = new THREE.Mesh(new THREE.BoxGeometry(9, 10, 8), new THREE.MeshStandardMaterial({ color: o.funnel || '#1b2228', roughness: 0.6 }));
  fun.position.set(fx, fb + 21, 0); fun.castShadow = true; group.add(fun);
  // aft mooring deck
  // forecastle
  const fore = new THREE.Mesh(new THREE.BoxGeometry(0.1 * L, 3, B * 0.5), new THREE.MeshStandardMaterial({ color: o.hull || '#1b2834', roughness: 0.7 }));
  fore.position.set(L / 2 - 0.1 * L, fb + 3.5, 0); group.add(fore);
  // lashing bridges: thin grey rails between bays
  const rail = new THREE.MeshStandardMaterial({ color: '#8e9294', roughness: 0.6, metalness: 0.4 });
  for (let x = startX - 0.4; x < endX; x += bayLen) {
    if (Math.abs(x + 6 - bridgeX) < 13) continue;
    const lb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5, B * 0.92), rail); lb.position.set(x, fb + 2.5, 0); lb.castShadow = true; group.add(lb);
  }
  group.userData = { L, B };
  return group;
}

// ---------- sea scene ----------
function seaScene(o) {
  const scene = new THREE.Scene();
  const su = skyUniforms(o);
  scene.add(makeSky(su));
  const ou = { ...su,
    uDeep: { value: C(o.deep) }, uShallow: { value: C(o.shallow) }, uFog: { value: C(o.fog ?? o.horizon) },
    uFogDensity: { value: o.fogDensity ?? 0.00028 }, uWaveAmp: { value: o.waveAmp ?? 1 }, uChop: { value: o.chop ?? 1 },
    uShipPos: { value: new THREE.Vector3(0, 0, 0) }, uShipDir: { value: new THREE.Vector2(1, 0) },
    uShipLen: { value: 300 }, uShipBeam: { value: 46 }, uWake: { value: o.wake ?? 1 },
  };
  scene.add(makeOcean(ou));
  const hemi = new THREE.HemisphereLight(C(o.zenith), C(o.deep), o.hemi ?? 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(C(o.sunColor), o.sunLight ?? 2.4);
  sun.position.copy(o.sunDir).normalize().multiplyScalar(800);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  const sc = sun.shadow.camera; sc.left = -260; sc.right = 260; sc.top = 260; sc.bottom = -260; sc.near = 10; sc.far = 2000;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
  scene.add(sun); scene.add(sun.target);
  // environment from sky for reflections
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene(); envScene.add(makeSky(su));
  scene.environment = pm.fromScene(envScene, 0.04).texture;
  scene.environmentIntensity = o.envIntensity ?? 0.6;
  return { scene, ou, sun };
}

function placeShip(scene, ou, sun, ship, x, z, heading) {
  ship.position.set(x, 0, z); ship.rotation.y = heading; scene.add(ship);
  ou.uShipPos.value.set(x, 0, z);
  ou.uShipDir.value.set(Math.cos(heading), -Math.sin(heading));
  ou.uShipLen.value = ship.userData.L; ou.uShipBeam.value = ship.userData.B;
  sun.target.position.set(x, 0, z);
  sun.position.add(new THREE.Vector3(x, 0, z));
}

// ---------- studio scene (materials) ----------
function studio(o) {
  const scene = new THREE.Scene();
  scene.background = null;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = o.env ?? 0.35;
  // cyclorama backdrop with radial light pool
  const bg = canvasTex(1024, 1024, (g, w, h) => {
    const grd = g.createRadialGradient(w * (o.poolX ?? 0.55), h * (o.poolY ?? 0.42), 10, w * 0.5, h * 0.5, w * 0.75);
    grd.addColorStop(0, o.pool || '#2f4d5e'); grd.addColorStop(0.55, o.mid || '#13222d'); grd.addColorStop(1, o.edge || '#070d12');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ map: bg, toneMapped: false }));
  backdrop.position.set(0, 0, -120); scene.add(backdrop);
  const floorTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = o.floor || '#121a20'; g.fillRect(0, 0, w, h);
    const r = rng(3); for (let i = 0; i < 9000; i++) { const v = Math.floor(r() * 30); g.fillStyle = `rgba(${v + 40},${v + 48},${v + 54},0.18)`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  }, { repeat: [8, 8] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.fog = new THREE.Fog(C(o.fog || '#0b141a'), o.fogNear ?? 60, o.fogFar ?? 220);
  const key = new THREE.SpotLight(C(o.key || '#ffd2a1'), o.keyPower ?? 9000, 0, Math.PI / 5, 0.6, 1.6);
  key.position.copy(o.keyPos || new THREE.Vector3(-40, 70, 40)); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0002; key.shadow.radius = 6;
  key.target.position.copy(o.target || new THREE.Vector3(0, 0, 0)); scene.add(key, key.target);
  const rim = new THREE.SpotLight(C(o.rim || '#7fb2d6'), o.rimPower ?? 6000, 0, Math.PI / 5, 0.7, 1.6);
  rim.position.copy(o.rimPos || new THREE.Vector3(50, 40, -60)); rim.target.position.copy(o.target || new THREE.Vector3()); scene.add(rim, rim.target);
  const fill = new THREE.HemisphereLight(C('#8fb0c4'), C('#0b1116'), o.fill ?? 0.35); scene.add(fill);
  return scene;
}

function cam(fov, pos, look) {
  const c = new THREE.PerspectiveCamera(fov, W / H, 0.5, 20000);
  c.position.copy(pos); c.lookAt(look); return c;
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- scene builders ----------
const SCENES = {
  'hero-sea'() {
    const o = { horizon: '#c3ccd0', zenith: '#3f5d74', sunDir: V3(0.55, 0.32, 0.75), sunColor: '#ffe6c8', sunPower: 0.55,
      deep: '#0b2232', shallow: '#2a5566', fogDensity: 0.00034, cloudCover: 0.62, cloudScale: 0.9, cloudLit: '#d9dfe2', cloudDark: '#6f8494', cloudSeed: 4.2,
      sunLight: 2.6, hemi: 1.2, envIntensity: 0.7, chop: 1.1, wake: 1.6 };
    const { scene, ou, sun } = seaScene(o);
    const ship = buildShip({ seed: 11, palette: 'muted', hull: '#1d2b37', tiers: 9, bridgeT: 0.7 });
    placeShip(scene, ou, sun, ship, 0, -40, Math.PI / 2 + 0.04); // bow pointing away (-z)
    const portrait = H > W;
    return { scene, camera: portrait ? cam(44, V3(14, 120, 400), V3(0, 0, -240)) : cam(30, V3(26, 88, 390), V3(-6, -2, -300)) };
  },
  'ship-broadside'() {
    const o = { horizon: '#d6dde0', zenith: '#58809d', sunDir: V3(-0.45, 0.28, 0.85), sunColor: '#fff0dc', sunPower: 0.6,
      deep: '#10293a', shallow: '#3b6a7a', fogDensity: 0.00022, cloudCover: 0.55, cloudScale: 0.7, cloudLit: '#f4f1ea', cloudDark: '#8394a1', cloudSeed: 1.7,
      sunLight: 2.6, envIntensity: 0.6, chop: 0.8, wake: 0.6 };
    const { scene, ou, sun } = seaScene(o);
    const ship = buildShip({ seed: 23, palette: 'muted', hull: '#202c36', tiers: 8, bridgeT: 0.68 });
    placeShip(scene, ou, sun, ship, 0, -300, -0.28);
    return { scene, camera: cam(22, V3(-40, 16, 380), V3(105, 30, -300)) };
  },
  'ship-red'() {
    const o = { horizon: '#e3e7e6', zenith: '#6c97b6', sunDir: V3(-0.5, 0.4, 0.75), sunColor: '#fff5e6', sunPower: 0.6,
      deep: '#123247', shallow: '#3f7487', fogDensity: 0.0002, cloudCover: 0.5, cloudScale: 0.8, cloudLit: '#ffffff', cloudDark: '#9aa8b2', cloudSeed: 8.3,
      sunLight: 3.0, envIntensity: 0.7, chop: 0.7, wake: 0.5 };
    const { scene, ou, sun } = seaScene(o);
    const ship = buildShip({ seed: 5, palette: 'muted', hull: '#9b2f22', tiers: 8, bridgeT: 0.72 });
    placeShip(scene, ou, sun, ship, 0, -300, 0.5);
    return { scene, camera: cam(28, V3(70, 34, 210), V3(20, 22, -300)) };
  },
  'aerial'() {
    const o = { horizon: '#9fc1d1', zenith: '#2b6a8f', sunDir: V3(0.4, 0.8, 0.3), sunColor: '#fff6e8', sunPower: 0.7,
      deep: '#0a3f5e', shallow: '#1f7a98', fogDensity: 0.00005, sunLight: 3.2, hemi: 1.4, envIntensity: 0.5, chop: 1.0, wake: 0.8 };
    const { scene, ou, sun } = seaScene(o);
    const ship = buildShip({ seed: 31, palette: 'vivid', hull: '#1d2a36', tiers: 7, bridgeT: 0.74 });
    placeShip(scene, ou, sun, ship, 40, 0, 0.0);
    const c = new THREE.PerspectiveCamera(30, W / H, 1, 20000); c.position.set(0, 820, 1); c.up.set(0, 0, -1); c.lookAt(0, 0, 0);
    c.up.set(1, 0, 0); c.lookAt(0, 0, 0);
    return { scene, camera: c };
  },
  'port-dusk'() {
    const o = { horizon: '#eab184', zenith: '#24395a', sunDir: V3(-0.75, 0.13, 0.65), sunColor: '#ffbf80', sunPower: 0.9,
      deep: '#0b1b28', shallow: '#2b3b45', fogDensity: 0.0004, cloudCover: 0.4, cloudScale: 0.8, cloudLit: '#f2b48a', cloudDark: '#3b4a60', cloudSeed: 2.9,
      sunLight: 2.8, hemi: 0.8, envIntensity: 0.5, chop: 0.5, wake: 0.0001 };
    const { scene, ou, sun } = seaScene(o);
    const ship = buildShip({ seed: 41, palette: 'muted', hull: '#1a242d', tiers: 6, bridgeT: 0.72 });
    placeShip(scene, ou, sun, ship, 0, -60, 0);
    ou.uWake.value = 0.0001;
    // quay
    const conc = new THREE.MeshStandardMaterial({ color: '#4a4f52', roughness: 0.9 });
    const quay = new THREE.Mesh(new THREE.BoxGeometry(1400, 6, 300), conc); quay.position.set(0, 2, -60 - 23 - 150 - 4); quay.receiveShadow = true; scene.add(quay);
    // container yard blocks
    const r = rng(77); const box = new THREE.BoxGeometry(12.2, 2.6, 2.44);
    const pal = CONTAINER_PALETTES.muted; const pts = [];
    for (let bx = -650; bx < 650; bx += 46) for (let row = 0; row < 7; row++) for (let lane = 0; lane < 3; lane++) {
      const tiers = 1 + Math.floor(r() * 5);
      for (let k = 0; k < tiers; k++) pts.push([bx + lane * 13.2, 6.3 + k * 2.62, -170 - row * 2.6 - (lane * 0), weighted(r, pal)]);
    }
    const inst = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ roughness: 0.75, bumpMap: corrugation(), bumpScale: 0.5 }), pts.length);
    const m4 = new THREE.Matrix4(); const cc = new THREE.Color();
    pts.forEach(([x, y, z, c], i) => { m4.makeTranslation(x, y, z); inst.setMatrixAt(i, m4); cc.set(c).multiplyScalar(0.8 + r() * 0.3); inst.setColorAt(i, cc); });
    inst.castShadow = inst.receiveShadow = true; scene.add(inst);
    // gantry cranes
    const steel = new THREE.MeshStandardMaterial({ color: '#d9d2c2', roughness: 0.55, metalness: 0.2 });
    const lightMat = new THREE.MeshBasicMaterial({ color: '#ffd9a0' });
    for (const cx of [-150, -40, 70, 180]) {
      const g = new THREE.Group();
      for (const lx of [-9, 9]) for (const lz of [-14, 14]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(1.8, 52, 1.8), steel); leg.position.set(lx, 26, lz); g.add(leg); }
      const beamB = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 150), steel); beamB.position.set(0, 54, 40); g.add(beamB);
      const top = new THREE.Mesh(new THREE.BoxGeometry(20, 3, 3), steel); top.position.set(0, 50, -14); g.add(top);
      const top2 = top.clone(); top2.position.z = 14; g.add(top2);
      const apex = new THREE.Mesh(new THREE.BoxGeometry(2, 22, 2), steel); apex.position.set(0, 66, -10); g.add(apex);
      for (const d of [1, -1]) { const tie = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 70), steel); tie.position.set(0, 66 - 6, -10 + d * 30 + 25); tie.rotation.x = d * 0.32; g.add(tie); }
      const trolley = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 8), new THREE.MeshStandardMaterial({ color: '#2a2f33' })); trolley.position.set(0, 50, 60 + (cx % 30)); g.add(trolley);
      for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), lightMat); l.position.set(0, 52, 10 + i * 30); g.add(l); }
      g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
      g.position.set(cx, 5, -110); scene.add(g);
    }
    // yard lights
    for (let x = -600; x < 600; x += 80) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 30, 6), steel); p.position.set(x, 20, -200); scene.add(p); const l = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), lightMat); l.position.set(x, 35, -200); scene.add(l); }
    return { scene, camera: cam(34, V3(-230, 46, 190), V3(30, 22, -120)) };
  },

  // ----- material still lifes -----
  textile() {
    const scene = studio({ pool: '#3b5a63', mid: '#16252e', key: '#ffd9ae', keyPos: V3(-50, 80, 60), rimPos: V3(60, 50, -40), target: V3(0, 6, 0) });
    const r = rng(9);
    const profile = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; const y = t * 16; const rr = 7.2 - t * 2.6 + Math.sin(t * Math.PI) * 0.5; profile.push(new THREE.Vector2(rr, y)); }
    profile.push(new THREE.Vector2(1.6, 16), new THREE.Vector2(1.6, 17.5));
    const cone = new THREE.LatheGeometry(profile, 96);
    const thread = (hex) => canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = hex; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2200; i++) {
        const y = (i / 2200) * h * 3 - h; g.strokeStyle = `rgba(${i % 3 ? 255 : 0},${i % 3 ? 255 : 0},${i % 3 ? 255 : 0},${0.05 + (i % 7) * 0.012})`;
        g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + h * 0.18); g.stroke();
      }
      for (let i = 0; i < 40; i++) { const y = (i / 40) * h; g.fillStyle = `rgba(0,0,0,${i % 2 ? 0.07 : 0.0})`; g.fillRect(0, y, w, h / 80); }
    }, { repeat: [6, 3] });
    const bumpT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const y = (i / 260) * h * 2 - h * 0.5; g.strokeStyle = i % 2 ? '#e8e8e8' : '#202020'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + h * 0.35); g.stroke(); } for (let i = 0; i < 260; i++) { const y = (i / 260) * h * 2 - h * 0.5; g.strokeStyle = 'rgba(30,30,30,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y - h * 0.35); g.stroke(); } }, { repeat: [8, 4], srgb: false });
    const colours = [['#efe9dc', 6], ['#f7f6f2', 4], ['#d9cbb0', 3], ['#2c3e66', 2], ['#e07a2e', 1.2], ['#8c9aa6', 1.5]];
    const mats = {};
    const tube = new THREE.MeshStandardMaterial({ color: '#c99d63', roughness: 0.7 });
    const peg = new THREE.MeshStandardMaterial({ color: '#2a3138', roughness: 0.5, metalness: 0.6 });
    for (let row = 0; row < 5; row++) for (let col = 0; col < 7; col++) {
      const hex = row === 1 && col === 3 ? '#e07a2e' : weighted(r, colours);
      mats[hex] ||= new THREE.MeshStandardMaterial({ map: thread(hex), bumpMap: bumpT, bumpScale: 3.0, roughness: 0.95 });
      const m = new THREE.Mesh(cone, mats[hex]);
      const x = (col - 3) * 17 + (row % 2) * 4, z = -row * 22;
      m.position.set(x, 0, z); m.castShadow = m.receiveShadow = true; scene.add(m);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 4, 32, 1, true), tube); t.position.set(x, 18, z); scene.add(t);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4, 12), peg); p.position.set(x, 20.5, z); scene.add(p);
    }
    return { scene, camera: cam(30, V3(18, 46, 92), V3(4, 6, -26)) };
  },
  petrochemicals() {
    const scene = studio({ pool: '#2f4f5c', mid: '#121f28', key: '#ffe0bd', keyPos: V3(-30, 70, 50), rimPos: V3(50, 30, -50), target: V3(0, 4, 0), fogFar: 260 });
    const r = rng(21);
    const pellet = new THREE.CylinderGeometry(0.42, 0.42, 0.62, 14);
    const pts = [];
    const heap = (cx, cz, R, Hh, n) => { for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2; const d = Math.sqrt(r()) * R; const hmax = Hh * Math.pow(1 - d / R, 1.15);
      const y = hmax - r() * Math.min(1.4, hmax) ; pts.push([cx + Math.cos(a) * d, Math.max(0.3, y), cz + Math.sin(a) * d]); } };
    heap(0, 0, 16, 9, 26000);
    for (let i = 0; i < 700; i++) { const a = r() * Math.PI * 2, d = 16 + r() * r() * 16; pts.push([Math.cos(a) * d, 0.3, Math.sin(a) * d]); }
    const mat = new THREE.MeshPhysicalMaterial({ color: '#eef3f3', roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2, sheen: 0.4, transmission: 0 });
    const inst = new THREE.InstancedMesh(pellet, mat, pts.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), c = new THREE.Color();
    pts.forEach(([x, y, z], i) => { e.set(r() * 6, r() * 6, r() * 6); q.setFromEuler(e); const k = 0.9 + r() * 0.25; s.set(k, k, k); m4.compose(V3(x, y, z), q, s); inst.setMatrixAt(i, m4); c.setHSL(0.55, 0.06, 0.82 + r() * 0.12); inst.setColorAt(i, c); });
    inst.castShadow = inst.receiveShadow = true; scene.add(inst);
    // steel scoop
    const scoop = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.4, 9, 48, 1, true, 0, Math.PI * 1.25), new THREE.MeshStandardMaterial({ color: '#b9c0c4', metalness: 0.9, roughness: 0.25, side: THREE.DoubleSide }));
    scoop.rotation.set(0.2, 0.8, Math.PI / 2 - 0.35); scoop.position.set(20, 5, 10); scoop.castShadow = true; scene.add(scoop);
    return { scene, camera: cam(28, V3(30, 34, 70), V3(2, 3, 0)) };
  },
  chemicals() {
    const scene = studio({ pool: '#2c4b5f', mid: '#111d27', key: '#ffdcb5', keyPos: V3(-60, 70, 40), rimPos: V3(60, 40, -30), target: V3(0, 8, -10), fogFar: 260 });
    const r = rng(33);
    const prof = [];
    const Hh = 17.6, R = 5.6;
    prof.push(new THREE.Vector2(0, 0), new THREE.Vector2(R - 0.3, 0), new THREE.Vector2(R, 0.4));
    for (let i = 1; i < 40; i++) { const y = (i / 40) * Hh; const rib = [0.33, 0.66].some((f) => Math.abs(y / Hh - f) < 0.018) ? 0.35 : 0; prof.push(new THREE.Vector2(R + rib, y)); }
    prof.push(new THREE.Vector2(R, Hh - 0.3), new THREE.Vector2(R - 0.3, Hh), new THREE.Vector2(0, Hh - 0.2));
    const drum = new THREE.LatheGeometry(prof, 64);
    const cols = [['#1f4f8a', 5], ['#e9eaea', 2], ['#2a6d5b', 1], ['#8a929a', 2]];
    const mats = {};
    const pallet = new THREE.MeshStandardMaterial({ color: '#8f6b44', roughness: 0.9 });
    for (let row = 0; row < 6; row++) for (let col = 0; col < 6; col++) {
      const hex = row === 0 && col === 2 ? '#e07a2e' : weighted(r, cols);
      mats[hex] ||= new THREE.MeshStandardMaterial({ color: hex, roughness: 0.38, metalness: 0.55 });
      const x = (col - 2.5) * 12.2 + (Math.floor(col / 2) * 3), z = -row * 13 - Math.floor(row / 2) * 4;
      const m = new THREE.Mesh(drum, mats[hex]); m.position.set(x, 1.3, z); m.rotation.y = r() * 6; m.castShadow = m.receiveShadow = true; scene.add(m);
      const bung = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), new THREE.MeshStandardMaterial({ color: '#d7d7d2', roughness: 0.4 })); bung.position.set(x + 2.6, 1.3 + Hh - 0.1, z + 1); scene.add(bung);
      if (col % 2 === 0 && row % 2 === 0) { const p = new THREE.Mesh(new THREE.BoxGeometry(25, 1.3, 26), pallet); p.position.set(x + 7.6, 0.65, z - 6.5); p.receiveShadow = p.castShadow = true; scene.add(p); }
    }
    return { scene, camera: cam(30, V3(-34, 30, 64), V3(0, 6, -22)) };
  },
  minerals() {
    const scene = studio({ pool: '#4a4a44', mid: '#1a1c1d', edge: '#090a0b', key: '#ffd6a8', keyPower: 11000, keyPos: V3(-70, 45, 30), rimPos: V3(50, 35, -50), rim: '#9cbcd4', target: V3(0, 4, 0), floor: '#17191b', fog: '#0e1011', fogFar: 240 });
    const r = rng(55);
    const rocks = [];
    for (let v = 0; v < 6; v++) {
      const g = new THREE.IcosahedronGeometry(1, 1); const p = g.attributes.position;
      const sx = 0.8 + r() * 0.5, sz = 0.8 + r() * 0.5;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const hsh = Math.abs(Math.sin(Math.round(x * 1000) * 12.9898 + Math.round(y * 1000) * 78.233 + Math.round(z * 1000) * 37.719 + v * 3.1) * 43758.5453) % 1;
        const k = 0.78 + hsh * 0.36; p.setXYZ(i, x * k * sx, y * k * 0.72, z * k * sz);
      }
      g.computeVertexNormals(); rocks.push(g);
    }
    const cols = ['#6f6a62', '#8a8478', '#55524d', '#9b8f7a', '#a87b4f', '#7c7f80', '#b9b2a4'];
    const mats = cols.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.88, metalness: 0.05, flatShading: true }));
    const Rr = 26, Hh = 15;
    for (let i = 0; i < 1500; i++) {
      const a = r() * Math.PI * 2; const d = Math.sqrt(r()) * Rr; const hmax = Hh * Math.pow(1 - d / Rr, 1.1);
      const s = 0.7 + r() * r() * 2.4;
      const m = new THREE.Mesh(pick(r, rocks), pick(r, mats));
      m.position.set(Math.cos(a) * d, Math.max(s * 0.5, hmax - r() * 2), Math.sin(a) * d - 4);
      m.rotation.set(r() * 6, r() * 6, r() * 6); m.scale.setScalar(s); m.castShadow = m.receiveShadow = true; scene.add(m);
    }
    for (let i = 0; i < 120; i++) { const a = r() * Math.PI * 2, d = Rr + r() * 14; const s = 0.5 + r() * 1.2; const m = new THREE.Mesh(pick(r, rocks), pick(r, mats)); m.position.set(Math.cos(a) * d, s * 0.4, Math.sin(a) * d - 4); m.rotation.set(r() * 6, r() * 6, r() * 6); m.scale.setScalar(s); m.castShadow = true; scene.add(m); }
    return { scene, camera: cam(30, V3(26, 30, 88), V3(0, 6, -4)) };
  },
  agro() {
    const scene = studio({ pool: '#4d5340', mid: '#1b1f17', edge: '#0a0c08', key: '#ffd29a', keyPos: V3(-60, 60, 70), rimPos: V3(60, 40, -40), target: V3(0, 10, 0), floor: '#1a1c15', fog: '#0d0f0a' });
    const r = rng(66);
    const endTex = (seed) => canvasTex(512, 512, (g, w, h) => {
      const rr = rng(seed); const cx = w / 2 + (rr() - 0.5) * 30, cy = h / 2 + (rr() - 0.5) * 30;
      g.fillStyle = '#4a3020'; g.fillRect(0, 0, w, h);
      for (let i = 60; i > 0; i--) { const rad = (i / 60) * w * 0.47; g.beginPath(); g.ellipse(cx, cy, rad, rad * (0.96 + rr() * 0.06), 0, 0, Math.PI * 2); const l = 58 + (i % 2) * 8 + rr() * 6; g.fillStyle = `hsl(32, 48%, ${l}%)`; g.fill(); }
      g.strokeStyle = 'rgba(70,40,20,0.35)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = rr() * 6.28; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * w * 0.4, cy + Math.sin(a) * w * 0.4); g.stroke(); }
      g.beginPath(); g.arc(w / 2, h / 2, w * 0.5, 0, Math.PI * 2); g.arc(w / 2, h / 2, w * 0.47, 0, Math.PI * 2, true); g.fillStyle = '#3a2618'; g.fill();
    });
    const barkTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#4b3424'; g.fillRect(0, 0, w, h); const rr = rng(4); for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(${20 + rr() * 60},${15 + rr() * 30},${10 + rr() * 15},0.6)`; g.lineWidth = 1 + rr() * 3; const x = rr() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (rr() - 0.5) * 20, h); g.stroke(); } }, { repeat: [2, 1] });
    const ends = [1, 2, 3, 4, 5].map((s) => new THREE.MeshStandardMaterial({ map: endTex(s), roughness: 0.9 }));
    const bark = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.95, bumpMap: barkTex, bumpScale: 1.5 });
    let rows = 6; let y = 0;
    for (let tier = 0; tier < 6; tier++) {
      for (let i = 0; i < rows; i++) {
        const R = 4.2 + r() * 1.2; const len = 60;
        const g = new THREE.CylinderGeometry(R, R, len, 40);
        const m = new THREE.Mesh(g, [bark, pick(r, ends), pick(r, ends)]);
        m.rotation.x = Math.PI / 2; m.position.set((i - (rows - 1) / 2) * 10 + (r() - 0.5), 5 + tier * 8.6, -len / 2 + 6 + (r() - 0.5) * 6);
        m.castShadow = m.receiveShadow = true; scene.add(m);
      }
      rows--; if (rows < 1) break;
    }
    return { scene, camera: cam(30, V3(46, 26, 92), V3(2, 18, -6)) };
  },
  packaging() {
    const scene = studio({ pool: '#3f5462', mid: '#15202a', key: '#ffdcb0', keyPos: V3(-50, 80, 50), rimPos: V3(60, 50, -40), target: V3(0, 10, 0), fogFar: 280 });
    const r = rng(77);
    const kraft = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#b08758'; g.fillRect(0, 0, w, h); const rr = rng(2); for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${90 + rr() * 80},${60 + rr() * 50},${30 + rr() * 30},0.25)`; g.fillRect(rr() * w, rr() * h, 1 + rr() * 6, 1); } }, { repeat: [3, 1] });
    const endT = (white) => canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = white ? '#e7e3da' : '#b9905f'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) { g.beginPath(); g.arc(w / 2, h / 2, w * 0.13 + (i / 160) * w * 0.37, 0, Math.PI * 2); g.strokeStyle = `rgba(0,0,0,${0.03 + (i % 5) * 0.012})`; g.lineWidth = 1; g.stroke(); }
      g.beginPath(); g.arc(w / 2, h / 2, w * 0.12, 0, Math.PI * 2); g.fillStyle = '#6d4e2f'; g.fill(); g.beginPath(); g.arc(w / 2, h / 2, w * 0.09, 0, Math.PI * 2); g.fillStyle = '#1a1410'; g.fill();
    });
    const endK = new THREE.MeshStandardMaterial({ map: endT(false), roughness: 0.85 });
    const endW = new THREE.MeshStandardMaterial({ map: endT(true), roughness: 0.8 });
    const sideK = new THREE.MeshStandardMaterial({ map: kraft, roughness: 0.85, bumpMap: kraft, bumpScale: 0.3 });
    const sideW = new THREE.MeshStandardMaterial({ color: '#ecebe6', roughness: 0.75 });
    // standing reels
    for (let i = 0; i < 9; i++) {
      const white = i === 4 || i === 7; const R = 9 + r() * 1.5, Hh = 18 + (i % 3) * 4;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Hh, 64), [white ? sideW : sideK, white ? endW : endK, white ? endW : endK]);
      m.position.set((i % 3 - 1) * 20 + (Math.floor(i / 3)) * 7 - 7, Hh / 2, -Math.floor(i / 3) * 21 - 6); m.castShadow = m.receiveShadow = true; scene.add(m);
      if (i < 3) { const top = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 12, 64), [sideK, endK, endK]); top.position.set(m.position.x + 1, Hh + 6, m.position.z); top.castShadow = top.receiveShadow = true; scene.add(top); }
    }
    // lying reel in front
    const lying = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 26, 64), [sideK, endK, endK]);
    lying.rotation.z = Math.PI / 2; lying.rotation.y = 0.5; lying.position.set(26, 8, 22); lying.castShadow = lying.receiveShadow = true; scene.add(lying);
    return { scene, camera: cam(32, V3(60, 40, 96), V3(4, 12, -10)) };
  },
};

// ---------- render + grade ----------
const built = SCENES[SCENE]();
built.camera.aspect = W / H; built.camera.updateProjectionMatrix();
renderer.toneMappingExposure = +params.get('exp') || 1.0;
renderer.render(built.scene, built.camera);
renderer.render(built.scene, built.camera);

const out = document.createElement('canvas'); out.width = W; out.height = H; out.id = 'out';
const g = out.getContext('2d');
g.imageSmoothingQuality = 'high';
g.drawImage(renderer.domElement, 0, 0, W, H);
// vignette
const vg = g.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62);
vg.addColorStop(0, 'rgba(4,10,16,0)'); vg.addColorStop(1, `rgba(4,10,16,${params.get('vig') || 0.42})`);
g.fillStyle = vg; g.fillRect(0, 0, W, H);
// film grain
const img = g.getImageData(0, 0, W, H); const d = img.data; const gr = rng(99); const amt = +(params.get('grain') || 7);
for (let i = 0; i < d.length; i += 4) { const n = (gr() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
g.putImageData(img, 0, 0);
document.body.innerHTML = ''; document.body.appendChild(out);
window.__done = true;
