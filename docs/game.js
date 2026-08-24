import { STR } from "./strings.js";

/* ---------------------------------------------------------------- config */

const CFG = {
  WORLD_W: 1800, WORLD_H: 1800,
  PLAYER_SPEED: 230, PLAYER_R: 16, PLAYER_MAXHP: 100,
  DASH_DIST: 150, DASH_TIME: 0.15, DASH_COOLDOWN: 2.2,
  PICKUP_RADIUS_BASE: 90, PICKUP_SPEED: 520,
  MAX_ALIVE: 55,
  SPAWN_DIST: 620,
  TILE: 256,
  DPR_CAP: 1.5,
  ANIM_COLS: 2, ANIM_ROWS: 2, ANIM_FRAMES: 4, ANIM_STRIDE: 24,
  KEYCARD_R: 40, GATE_R: 60, REPAIR_R: 70, REPAIR_TIME: 12,
  GENERATOR_R: 50, GENERATOR_HP: 260, CANISTER_R: 36, EXTRACTION_R: 70,
  DEFEND_AGGRO_CHANCE: 0.3,
};

const WEAPONS = {
  pistol:  { label: "weaponPistol",  dmg: 14, cooldown: 0.25, bulletSpeed: 760, range: 480, spread: 0.035, pellets: 1, color: "#ffe27a" },
  smg:     { label: "weaponSmg",     dmg: 7,  cooldown: 0.10, bulletSpeed: 720, range: 460, spread: 0.14,  pellets: 1, color: "#7ad1ff" },
  shotgun: { label: "weaponShotgun", dmg: 9,  cooldown: 0.62, bulletSpeed: 640, range: 320, spread: 0.35,  pellets: 5, color: "#ff8a4a" },
};

const ZTYPES = {
  walker:  { hp: 30,  speed: 70,  dmg: 8,  atkCd: 0.8, r: 16, coin: 5,   img: "zombie_walker" },
  runner:  { hp: 20,  speed: 190, dmg: 7,  atkCd: 0.7, r: 14, coin: 8,   img: "zombie_runner" },
  spitter: { hp: 25,  speed: 50,  dmg: 12, atkCd: 2.0, r: 16, coin: 10,  img: "zombie_spitter", ranged: true, range: 360, projSpeed: 300 },
  brute:   { hp: 400, speed: 60,  dmg: 24, atkCd: 1.0, r: 32, coin: 100, img: "zombie_brute", boss: true },
};

const UPGRADE_POOL = [
  { id: "hp",     str: "upgradeHp",       apply: p => { p.maxHpBonus += 20; p.hp = p.maxHp(); } },
  { id: "dmg",    str: "upgradeDmg",      apply: p => { p.dmgMult *= 1.2; } },
  { id: "rate",   str: "upgradeFireRate", apply: p => { p.fireRateMult *= 1.15; } },
  { id: "speed",  str: "upgradeSpeed",    apply: p => { p.speedMult *= 1.10; } },
  { id: "dash",   str: "upgradeDash",     apply: p => { p.dashCdMult *= 0.8; } },
  { id: "pierce", str: "upgradePierce",   apply: p => { p.pierce += 1; } },
  { id: "magnet", str: "upgradeMagnet",   apply: p => { p.magnetMult *= 1.4; } },
];

/* ------------------------------------------------------------------ rng */

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rng = mulberry32(Date.now() & 0xffffffff);
const rand = (a = 1, b) => (b === undefined ? rng() * a : a + rng() * (b - a));
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const choice = arr => arr[Math.floor(rng() * arr.length)];

/* --------------------------------------------------------------- assets */

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3HI9gs6RQRwUiu31B6zzxWQryLj/";
const IMAGE_URLS = {
  hero_survivor: CDN + "hf_20260824_180223_964ab4f6-669e-4bc3-bbd5-ead653e5d504.png",
  zombie_walker: CDN + "hf_20260824_180224_85680e0a-75f5-4936-872d-47235b36cb67.png",
  zombie_runner: CDN + "hf_20260824_180228_edb1e260-5b54-40ba-b994-7484167b57f5.png",
  zombie_spitter: CDN + "hf_20260824_180230_b0e3ba88-1e4d-4925-b75b-2acedb67499c.png",
  zombie_brute: CDN + "hf_20260824_180234_bcd9e99a-4cb4-4851-80ec-932ae0661a62.png",
  pickup_weapon_crate: CDN + "hf_20260803_012151_5e90fe88-4782-4f88-ba8a-7879c84a1af0.png",
  pickup_health: CDN + "hf_20260803_012154_adb6d1e5-8d9f-460e-aa08-aa533f0da88f.png",
  pickup_coin: CDN + "hf_20260803_012157_b0de0b00-868b-4cc1-916d-fbe9b4d471a5.png",
  ground_tile: CDN + "hf_20260803_012159_d040ab55-f23e-4c2a-88b1-e4fd41ce8028.png",
  title_background: CDN + "hf_20260803_012201_0e24b347-5a57-4fb2-878f-2a51764f5386.png",
  keycard: CDN + "hf_20260824_183305_0da66156-df09-417c-ba0b-440a9665fc63.png",
  gate: CDN + "hf_20260824_183310_722db1a7-0a99-481d-b9e8-e88fbbeb1005.png",
  station: CDN + "hf_20260824_183314_fc3ad18c-348c-4ddd-a6f4-f44ff6857ca5.png",
  generator: CDN + "hf_20260824_183329_ddbd5ab8-1d27-4efe-8670-747a7c2be553.png",
  fuel_canister: CDN + "hf_20260824_183333_c196facf-d036-44e4-9cef-559da8d4978a.png",
};

const LEVELS = [
  { name: "Downtown Plaza",        img: CDN + "hf_20260824_180236_e1f7048f-908c-40d6-9a4a-11844df6bfca.png", obj: "survive" },
  { name: "Warehouse District",    img: CDN + "hf_20260824_180238_474c7c19-9436-42a1-abaa-a871d60747bb.png", obj: "keycard" },
  { name: "Highway Overpass",      img: CDN + "hf_20260824_180240_48ab8d00-298a-48ae-9c2a-3264d70f3c2f.png", obj: "repair" },
  { name: "Subway Station",        img: CDN + "hf_20260824_180243_781024a3-a30b-46c4-8c5b-a649112f648f.png", obj: "defend" },
  { name: "Shopping Mall",         img: CDN + "hf_20260824_180245_baba9436-9aaa-4a53-96ae-693e0fb8c9a7.png", obj: "collect" },
  { name: "Parking Garage",        img: CDN + "hf_20260824_180247_0fa56f61-3e11-41d7-b69c-843d705bfca9.png", obj: "survive" },
  { name: "Cargo Docks",           img: CDN + "hf_20260824_180250_cffcf28e-38bf-4357-b4df-b034ca085141.png", obj: "keycard" },
  { name: "Hospital Courtyard",    img: CDN + "hf_20260824_180252_bfe83d66-3850-405c-a1e8-cc8dbda124cb.png", obj: "repair" },
  { name: "Stadium",               img: CDN + "hf_20260824_180254_176e5dbe-7922-40b2-8137-f6ced3b205de.png", obj: "defend" },
  { name: "Junkyard",              img: CDN + "hf_20260824_180256_29672db6-a9da-4ccc-a308-e4d3c72e73eb.png", obj: "collect" },
  { name: "Rooftop Helipad",       img: CDN + "hf_20260824_183110_b8cc71da-3068-4e40-ab40-45200dc0add7.png", obj: "survive" },
  { name: "Farmhouse Silo Yard",   img: CDN + "hf_20260824_183125_9b0008d3-d5df-4b4f-acb3-9d624406dd3f.png", obj: "keycard" },
  { name: "Amusement Park Midway", img: CDN + "hf_20260824_183128_548b6bd1-f15c-44e7-939f-ca994867a613.png", obj: "repair" },
  { name: "Sewer Tunnels",         img: CDN + "hf_20260824_183130_e0072cc2-bacf-48e1-9588-f2b3e8c86db0.png", obj: "defend" },
  { name: "Research Lab Atrium",   img: CDN + "hf_20260824_183132_03d7ed06-b5fe-402c-8882-d12f999f1355.png", obj: "collect" },
  { name: "Prison Cell Block",     img: CDN + "hf_20260824_183141_11024146-0430-4d56-aead-d963ab93bdda.png", obj: "survive" },
  { name: "Ski Lodge Resort",      img: CDN + "hf_20260824_183144_4062232e-1adb-488b-997c-db4ffe7243d2.png", obj: "keycard" },
  { name: "Oil Refinery",          img: CDN + "hf_20260824_183146_893e392f-25ae-448a-b297-71ffd83ae5f6.png", obj: "repair" },
  { name: "Airport Terminal",      img: CDN + "hf_20260824_183202_b1492d78-bb87-458f-8ca0-e0c4b2f2901f.png", obj: "defend" },
  { name: "Construction Site",     img: CDN + "hf_20260824_183216_923a6e71-fafc-4fd4-a4e9-7d5b7722d58c.png", obj: "collect" },
  { name: "Cemetery",              img: CDN + "hf_20260824_183238_97652c97-cab6-43f4-9336-7ba9efc46bf8.png", obj: "survive" },
  { name: "Farmers Market",        img: CDN + "hf_20260824_183240_5697af87-2ee7-40bd-ae0b-2e3c83483278.png", obj: "keycard" },
  { name: "Power Substation",      img: CDN + "hf_20260824_183248_fb0b694f-3b72-44c0-89aa-65b0cc54e00b.png", obj: "repair" },
  { name: "Marina Boatyard",       img: CDN + "hf_20260824_183256_f2b75ed4-95d2-4c1c-9825-c49a39a3da91.png", obj: "defend" },
  { name: "Rail Yard",             img: CDN + "hf_20260824_183301_eb2b9ee5-1f90-4e28-9eca-55879b0efe64.png", obj: "collect" },
];
const AUDIO_URLS = {
  music_combat: CDN + "hf_20260803_012204_e98d7f91-5445-48bd-87fb-94887f728f67.m4a",
  sfx_gunshot: CDN + "hf_20260803_012207_3dc07510-a705-4ef2-8068-678f0be05fcb.mp3",
  sfx_shotgun: CDN + "hf_20260803_012209_f83851e0-e575-4180-b8e4-cc1852409a2b.mp3",
  sfx_zombie_hit: CDN + "hf_20260803_012213_32d77823-6d5a-4c1b-8acc-21937f294b87.mp3",
  sfx_player_hurt: CDN + "hf_20260803_012218_30c7bb78-8c6e-40c5-969e-f52ba882c1f9.mp3",
  sfx_pickup: CDN + "hf_20260803_012221_d356ba7d-3835-4c4b-a199-0d4dd1d92065.mp3",
};

const images = {};
const sfxBuffers = {};
let musicEl = null;

const ASSET_TIMEOUT_MS = 8000;
function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise(r => setTimeout(r, ms))]);
}

async function loadAssets(onProgress) {
  const imgNames = Object.keys(IMAGE_URLS);
  const sfxNames = Object.keys(AUDIO_URLS).filter(n => n !== "music_combat");
  const total = imgNames.length + sfxNames.length + 1;
  let done = 0;
  const bump = () => { done++; onProgress(done / total); };

  await Promise.all(imgNames.map(name => withTimeout(new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { images[name] = img; resolve(); };
    img.onerror = () => resolve();
    img.src = IMAGE_URLS[name];
  }), ASSET_TIMEOUT_MS).then(bump)));

  await Promise.all(sfxNames.map(name => withTimeout(new Promise(resolve => {
    const a = new Audio(AUDIO_URLS[name]);
    a.preload = "auto";
    a.oncanplaythrough = () => { sfxBuffers[name] = a; resolve(); };
    a.onerror = () => resolve();
    a.load();
  }), ASSET_TIMEOUT_MS).then(bump)));

  musicEl = new Audio(AUDIO_URLS.music_combat);
  musicEl.loop = true;
  musicEl.volume = 0.35;
  bump();
}

const levelImageCache = {};
function loadLevelImage(url) {
  if (levelImageCache[url]) return Promise.resolve(levelImageCache[url]);
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { levelImageCache[url] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

let muted = localStorage.getItem("ws_muted") === "1";
function playSfx(name, vol = 0.6) {
  if (muted) return;
  const src = sfxBuffers[name];
  if (!src) return;
  const node = src.cloneNode();
  node.volume = vol;
  node.play().catch(() => {});
}
function setMuted(v) {
  muted = v;
  localStorage.setItem("ws_muted", v ? "1" : "0");
  if (musicEl) musicEl.muted = v;
  document.getElementById("mutebtn").textContent = v ? "🔇" : "♪";
}

/* --------------------------------------------------------------- input */

const held = new Set();
const BIND = {
  KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right",
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  Space: "dash",
};
addEventListener("keydown", e => { const c = BIND[e.code]; if (c) { held.add(c); e.preventDefault(); } });
addEventListener("keyup", e => { const c = BIND[e.code]; if (c) held.delete(c); });

const move = { x: 0, y: 0 };
const aim = { x: 0, y: 0, active: false };
let dashRequested = false;
let mouseDown = false;
let mousePos = { x: 0, y: 0 };
addEventListener("mousemove", e => { mousePos.x = e.clientX; mousePos.y = e.clientY; });
addEventListener("mousedown", e => { mouseDown = true; });
addEventListener("mouseup", () => { mouseDown = false; });

function setupStick(zoneEl, knobEl, onMove, onEnd) {
  let active = false, id = null, ox = 0, oy = 0;
  const maxR = 46;
  function start(x, y, pid) {
    active = true; id = pid;
    const r = zoneEl.getBoundingClientRect();
    ox = r.left + r.width / 2; oy = r.top + r.height / 2;
  }
  function move_(x, y) {
    if (!active) return;
    let dx = x - ox, dy = y - oy;
    const d = Math.hypot(dx, dy) || 1;
    const cl = Math.min(d, maxR);
    dx = dx / d * cl; dy = dy / d * cl;
    knobEl.style.transform = `translate(${dx}px,${dy}px)`;
    onMove(dx / maxR, dy / maxR, d / maxR);
  }
  function end() {
    if (!active) return;
    active = false; id = null;
    knobEl.style.transform = "translate(0,0)";
    onEnd();
  }
  zoneEl.addEventListener("touchstart", e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    start(t.clientX, t.clientY, t.identifier);
    move_(t.clientX, t.clientY);
  }, { passive: false });
  zoneEl.addEventListener("touchmove", e => {
    e.preventDefault();
    for (const t of e.changedTouches) if (t.identifier === id) move_(t.clientX, t.clientY);
  }, { passive: false });
  addEventListener("touchend", e => {
    for (const t of e.changedTouches) if (t.identifier === id) end();
  });
  addEventListener("touchcancel", e => {
    for (const t of e.changedTouches) if (t.identifier === id) end();
  });
  // mouse fallback for desktop testing of virtual sticks
  zoneEl.addEventListener("mousedown", e => { start(e.clientX, e.clientY, "mouse"); move_(e.clientX, e.clientY); });
  addEventListener("mousemove", e => { if (active && id === "mouse") move_(e.clientX, e.clientY); });
  addEventListener("mouseup", () => { if (id === "mouse") end(); });
}

setupStick(document.getElementById("stick-l"), document.getElementById("knob-l"),
  (dx, dy) => { move.x = dx; move.y = dy; },
  () => { move.x = 0; move.y = 0; });

setupStick(document.getElementById("stick-r"), document.getElementById("knob-r"),
  (dx, dy, mag) => { aim.x = dx; aim.y = dy; aim.active = mag > 0.15; },
  () => { aim.active = false; });

document.getElementById("dashbtn").addEventListener("touchstart", e => { e.preventDefault(); dashRequested = true; }, { passive: false });
document.getElementById("dashbtn").addEventListener("mousedown", () => { dashRequested = true; });

const PAD_DEAD = 0.2;
function padState() {
  const out = { mx: 0, my: 0, ax: 0, ay: 0, aiming: false, dash: false };
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const gp of pads) {
    if (!gp) continue;
    const lx = gp.axes[0] || 0, ly = gp.axes[1] || 0;
    const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
    if (Math.hypot(lx, ly) > PAD_DEAD) { out.mx = lx; out.my = ly; }
    if (Math.hypot(rx, ry) > PAD_DEAD) { out.ax = rx; out.ay = ry; out.aiming = true; }
    if (gp.buttons[0] && gp.buttons[0].pressed) out.dash = true;
  }
  return out;
}

function pollCommands() {
  let mx = 0, my = 0;
  if (held.has("left")) mx -= 1;
  if (held.has("right")) mx += 1;
  if (held.has("up")) my -= 1;
  if (held.has("down")) my += 1;
  const gp = padState();
  if (gp.mx || gp.my) { mx = gp.mx; my = gp.my; }
  if (mx === 0 && my === 0) { mx = move.x; my = move.y; }

  let ax = 0, ay = 0, aiming = false;
  if (mouseDown && world) {
    const p = world.player;
    const [sx, sy] = worldToScreen(p.x, p.y);
    const dx = mousePos.x - sx, dy = mousePos.y - sy;
    const d = Math.hypot(dx, dy);
    if (d > 4) { ax = dx / d; ay = dy / d; aiming = true; }
  }
  if (aim.active) { ax = aim.x; ay = aim.y; aiming = true; }
  if (gp.aiming) { ax = gp.ax; ay = gp.ay; aiming = true; }

  const dash = held.has("dash") || dashRequested || gp.dash;
  dashRequested = false;
  held.delete("dash");
  return { mx, my, ax, ay, aiming, dash };
}

/* ------------------------------------------------------------- canvas */

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
let vw = innerWidth, vh = innerHeight;
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, CFG.DPR_CAP);
  vw = innerWidth; vh = innerHeight;
  canvas.width = vw * dpr; canvas.height = vh * dpr;
  canvas.style.width = vw + "px"; canvas.style.height = vh + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
addEventListener("orientationchange", resize);
resize();

/* --------------------------------------------------------------- state */

const STATE = { MENU: 0, PLAYING: 1, BREAK: 2, GAMEOVER: 3, PAUSED: 4 };
let state = STATE.MENU;
let prevStateBeforePause = STATE.MENU;

let world = null; // populated by resetWorld()
let clampedGround = null;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function makePlayer() {
  return {
    x: CFG.WORLD_W / 2, y: CFG.WORLD_H / 2, px: 0, py: 0, animDist: 0,
    r: CFG.PLAYER_R, hp: CFG.PLAYER_MAXHP,
    maxHpBonus: 0, dmgMult: 1, fireRateMult: 1, speedMult: 1, dashCdMult: 1, pierce: 0, magnetMult: 1,
    weapon: "pistol", fireCd: 0, dashCd: 0, dashing: 0, dashDirX: 1, dashDirY: 0, invuln: 0,
    facing: 0, alive: true,
    maxHp() { return CFG.PLAYER_MAXHP + this.maxHpBonus; },
  };
}

function resetWorld() {
  world = {
    player: makePlayer(),
    zombies: [],
    bullets: [],
    enemyProjectiles: [],
    pickups: [],
    particles: [],
    wave: 0,
    coins: 0,
    score: 0,
    spawnQueue: [],
    spawnTimer: 0,
    breakTimer: 0,
    upgradeChoices: [],
    camX: CFG.WORLD_W / 2, camY: CFG.WORLD_H / 2,
    time: 0,
    levelIndex: null,
    objective: null,
    levelBgImage: null,
    endReason: null,
  };
}

/* ------------------------------------------------------------ mission */

function randPointNear(cx, cy, rMin, rMax) {
  const a = rand(Math.PI * 2), r = rand(rMin, rMax);
  return [clamp(cx + Math.cos(a) * r, 60, CFG.WORLD_W - 60), clamp(cy + Math.sin(a) * r, 60, CFG.WORLD_H - 60)];
}

function makeObjective(lvl) {
  const cx = CFG.WORLD_W / 2, cy = CFG.WORLD_H / 2;
  if (lvl.obj === "survive") {
    return { type: "survive", targetWave: 5 };
  }
  if (lvl.obj === "keycard") {
    const [kx, ky] = randPointNear(cx, cy, 300, 650);
    const [gx, gy] = randPointNear(cx, cy, 300, 650);
    return { type: "keycard", phase: "find", keyX: kx, keyY: ky, gateX: gx, gateY: gy };
  }
  if (lvl.obj === "repair") {
    const [rx, ry] = randPointNear(cx, cy, 150, 400);
    return { type: "repair", repairX: rx, repairY: ry, progress: 0 };
  }
  if (lvl.obj === "defend") {
    return { type: "defend", genX: cx, genY: cy, genHp: CFG.GENERATOR_HP, targetWave: 5 };
  }
  if (lvl.obj === "collect") {
    const needed = 3;
    const canisters = [];
    for (let i = 0; i < needed; i++) {
      const [x, y] = randPointNear(cx, cy, 250, 700);
      canisters.push({ x, y, taken: false });
    }
    const [ex, ey] = randPointNear(cx, cy, 500, 750);
    return { type: "collect", canisters, needed, collected: 0, extractX: ex, extractY: ey, extractReady: false };
  }
}

function updateObjective(dt, p) {
  const obj = world.objective;
  if (!obj || obj.done) return;
  if (obj.type === "keycard") {
    if (obj.phase === "find") {
      if (dist(p.x, p.y, obj.keyX, obj.keyY) < CFG.KEYCARD_R) {
        obj.phase = "gate";
        toast(STR.keycardFound);
        spawnParticles(obj.keyX, obj.keyY, 12, "#7ad1ff");
      }
    } else if (obj.phase === "gate") {
      if (dist(p.x, p.y, obj.gateX, obj.gateY) < CFG.GATE_R) {
        obj.done = true;
        enterEnd("complete");
      }
    }
  } else if (obj.type === "repair") {
    if (dist(p.x, p.y, obj.repairX, obj.repairY) < CFG.REPAIR_R) {
      obj.progress += dt;
      if (rng() < dt * 6) spawnParticles(obj.repairX, obj.repairY, 1, "#7ad1ff");
      if (obj.progress >= CFG.REPAIR_TIME) {
        obj.done = true;
        enterEnd("complete");
      }
    }
  } else if (obj.type === "collect") {
    for (const c of obj.canisters) {
      if (!c.taken && dist(p.x, p.y, c.x, c.y) < CFG.CANISTER_R) {
        c.taken = true;
        obj.collected++;
        playSfx("sfx_pickup", 0.5);
        if (obj.collected >= obj.needed) { obj.extractReady = true; toast(STR.extractionReady); }
      }
    }
    if (obj.extractReady && dist(p.x, p.y, obj.extractX, obj.extractY) < CFG.EXTRACTION_R) {
      obj.done = true;
      enterEnd("complete");
    }
  }
  // survive & defend objectives are resolved by wave-clear detection in updateSpawning
}

function damageGenerator(amt) {
  const obj = world.objective;
  if (!obj || obj.genHp <= 0) return;
  obj.genHp = Math.max(0, obj.genHp - amt);
  spawnParticles(obj.genX, obj.genY, 4, "#7ad1ff");
  if (obj.genHp <= 0) enterEnd("failed");
}

function getCompletedSet() {
  try { return new Set(JSON.parse(localStorage.getItem("ws_completed") || "[]")); }
  catch { return new Set(); }
}
function markLevelComplete(idx) {
  const s = getCompletedSet();
  s.add(idx);
  localStorage.setItem("ws_completed", JSON.stringify([...s]));
}

/* ---------------------------------------------------------- wave logic */

function waveComposition(w) {
  const list = [];
  let total = 6 + w * 2;
  if (w % 5 === 0) {
    list.push("brute");
    total = Math.floor(total * 0.6);
  }
  const weights = [["walker", 1]];
  if (w >= 2) weights.push(["runner", 0.5 + w * 0.03]);
  if (w >= 3) weights.push(["spitter", 0.35 + w * 0.02]);
  const sum = weights.reduce((s, [, wt]) => s + wt, 0);
  for (let i = 0; i < total; i++) {
    let r = rand(sum), acc = 0, pick = weights[0][0];
    for (const [type, wt] of weights) { acc += wt; if (r <= acc) { pick = type; break; } }
    list.push(pick);
  }
  return list;
}

function startWave(w) {
  world.wave = w;
  world.spawnQueue = shuffle(waveComposition(w));
  world.spawnTimer = 0;
  state = STATE.PLAYING;
  updateHint(w === 1 ? `${STR.hintMove}\n${STR.hintAim}` : "", w === 1);
  if (w % 5 === 0) toast(STR.bossIncoming);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function spawnZombie(type) {
  const def = ZTYPES[type];
  const wv = world.wave;
  const scale = 1 + (wv - 1) * 0.07;
  const ang = rand(Math.PI * 2);
  const p = world.player;
  let x = clamp(p.x + Math.cos(ang) * CFG.SPAWN_DIST, def.r, CFG.WORLD_W - def.r);
  let y = clamp(p.y + Math.sin(ang) * CFG.SPAWN_DIST, def.r, CFG.WORLD_H - def.r);
  world.zombies.push({
    type, x, y, px: x, py: y, animDist: 0, r: def.r,
    hp: def.hp * (def.boss ? 1 : scale), maxHp: def.hp * (def.boss ? 1 : scale),
    speed: def.speed, dmg: def.dmg * (1 + (wv - 1) * 0.03), atkCd: def.atkCd, atkTimer: rand(def.atkCd),
    ranged: !!def.ranged, range: def.range, projSpeed: def.projSpeed, coin: def.coin, boss: !!def.boss,
    aggroGen: !def.ranged && world.objective && world.objective.type === "defend" && rng() < CFG.DEFEND_AGGRO_CHANCE,
    hitFlash: 0, dead: false,
  });
}

/* ------------------------------------------------------------ actions */

function fireWeapon(p, dirX, dirY) {
  const w = WEAPONS[p.weapon];
  const cd = w.cooldown / p.fireRateMult;
  if (p.fireCd > 0) return;
  p.fireCd = cd;
  playSfx(p.weapon === "shotgun" ? "sfx_shotgun" : "sfx_gunshot", 0.5);
  for (let i = 0; i < w.pellets; i++) {
    const spread = (rand() - 0.5) * w.spread * 2;
    const ang = Math.atan2(dirY, dirX) + spread;
    world.bullets.push({
      x: p.x, y: p.y, vx: Math.cos(ang) * w.bulletSpeed, vy: Math.sin(ang) * w.bulletSpeed,
      dmg: w.dmg * p.dmgMult, range: w.range, traveled: 0, pierce: p.pierce, color: w.color,
    });
  }
}

function nearestZombie(x, y, maxRange) {
  let best = null, bd = maxRange;
  for (const z of world.zombies) {
    if (z.dead) continue;
    const d = dist(x, y, z.x, z.y);
    if (d < bd) { bd = d; best = z; }
  }
  return best;
}

function spawnPickup(type, x, y) {
  world.pickups.push({ type, x, y, born: world.time });
}

function killZombie(z) {
  z.dead = true;
  world.score += z.boss ? 500 : 10;
  world.coins += z.coin;
  spawnParticles(z.x, z.y, z.boss ? 26 : 10, "#8fae5a");
  const r = rng();
  if (r < 0.55) spawnPickup("coin", z.x, z.y);
  else if (r < 0.68) spawnPickup("health", z.x, z.y);
  else if (r < 0.75 && world.wave >= 2) spawnPickup("weapon", z.x, z.y);
  playSfx("sfx_zombie_hit", 0.5);
}

function spawnParticles(x, y, n, color) {
  for (let i = 0; i < n; i++) {
    const a = rand(Math.PI * 2), sp = rand(40, 160);
    world.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.25, 0.6), color });
  }
}

/* --------------------------------------------------------------- hint */

let hintTimer = 0;
function updateHint(text, persist) {
  const el = document.getElementById("hint");
  el.textContent = text;
  el.style.opacity = text ? "1" : "0";
  hintTimer = persist ? 6 : 0;
}
let toastTimer = 0, toastText = "";
function toast(t) { toastText = t; toastTimer = 2.2; }

/* ------------------------------------------------------------ update */

const STEP = 1 / 60;

function update(dt) {
  const cmd = pollCommands();
  world.time += dt;
  if (hintTimer > 0) { hintTimer -= dt; if (hintTimer <= 0) updateHint("", false); }
  if (toastTimer > 0) toastTimer -= dt;

  if (state === STATE.PLAYING) updatePlaying(dt, cmd);
  else if (state === STATE.BREAK) updateBreak(dt);

  updateParticles(dt);
}

function updatePlaying(dt, cmd) {
  const p = world.player;
  p.px = p.x; p.py = p.y;

  const mlen = Math.hypot(cmd.mx, cmd.my);
  let mx = cmd.mx, my = cmd.my;
  if (mlen > 1) { mx /= mlen; my /= mlen; }
  if (mlen > 0.05) p.facing = Math.atan2(my, mx);

  if (p.dashing > 0) {
    p.dashing -= dt;
    p.x = clamp(p.x + p.dashDirX * (CFG.DASH_DIST / CFG.DASH_TIME) * dt, p.r, CFG.WORLD_W - p.r);
    p.y = clamp(p.y + p.dashDirY * (CFG.DASH_DIST / CFG.DASH_TIME) * dt, p.r, CFG.WORLD_H - p.r);
  } else {
    const sp = CFG.PLAYER_SPEED * p.speedMult;
    p.x = clamp(p.x + mx * sp * dt, p.r, CFG.WORLD_W - p.r);
    p.y = clamp(p.y + my * sp * dt, p.r, CFG.WORLD_H - p.r);
    if (p.dashCd <= 0 && cmd.dash) {
      p.dashing = CFG.DASH_TIME;
      p.dashCd = CFG.DASH_COOLDOWN * p.dashCdMult;
      p.invuln = CFG.DASH_TIME + 0.1;
      p.dashDirX = mlen > 0.05 ? mx : Math.cos(p.facing);
      p.dashDirY = mlen > 0.05 ? my : Math.sin(p.facing);
      spawnParticles(p.x, p.y, 8, "#e8b93a");
    }
  }
  p.animDist += dist(p.x, p.y, p.px, p.py);
  if (p.dashCd > 0) p.dashCd -= dt;
  if (p.invuln > 0) p.invuln -= dt;
  if (p.fireCd > 0) p.fireCd -= dt;

  // aiming / auto target
  let aimX = 0, aimY = 0, hasAim = false;
  if (cmd.aiming) {
    const alen = Math.hypot(cmd.ax, cmd.ay);
    if (alen > 0.1) { aimX = cmd.ax / alen; aimY = cmd.ay / alen; hasAim = true; p.facing = Math.atan2(aimY, aimX); }
  }
  if (!hasAim) {
    const target = nearestZombie(p.x, p.y, WEAPONS[p.weapon].range);
    if (target) {
      const d = dist(p.x, p.y, target.x, target.y) || 1;
      aimX = (target.x - p.x) / d; aimY = (target.y - p.y) / d;
      hasAim = true; p.facing = Math.atan2(aimY, aimX);
    }
  }
  if (hasAim) fireWeapon(p, aimX, aimY);

  // camera
  world.camX += (p.x - world.camX) * Math.min(1, dt * 6);
  world.camY += (p.y - world.camY) * Math.min(1, dt * 6);

  updateSpawning(dt);
  updateZombies(dt, p);
  updateBullets(dt);
  updateEnemyProjectiles(dt, p);
  updatePickups(dt, p);
  if (world.objective) updateObjective(dt, p);

  if (p.hp <= 0 && p.alive) { p.alive = false; enterEnd(world.objective ? "failed" : "died"); }
}

function updateSpawning(dt) {
  world.spawnTimer -= dt;
  const interval = Math.max(0.35, 1.1 - world.wave * 0.04);
  const alive = world.zombies.filter(z => !z.dead).length;
  if (world.spawnTimer <= 0 && world.spawnQueue.length && alive < CFG.MAX_ALIVE) {
    spawnZombie(world.spawnQueue.shift());
    world.spawnTimer = interval;
  }
  if (!world.spawnQueue.length && world.zombies.every(z => z.dead)) {
    const obj = world.objective;
    if (obj && (obj.type === "survive" || obj.type === "defend") && world.wave >= obj.targetWave) {
      enterEnd("complete");
    } else {
      enterBreak();
    }
  }
}

function updateZombies(dt, p) {
  const obj = world.objective;
  const genActive = obj && obj.type === "defend" && obj.genHp > 0;
  for (const z of world.zombies) {
    if (z.dead) continue;
    z.px = z.x; z.py = z.y;
    if (z.hitFlash > 0) z.hitFlash -= dt;
    z.atkTimer -= dt;

    if (z.ranged) {
      const d = dist(z.x, z.y, p.x, p.y) || 1;
      if (d > z.range * 0.6) {
        z.x = clamp(z.x + (p.x - z.x) / d * z.speed * dt, z.r, CFG.WORLD_W - z.r);
        z.y = clamp(z.y + (p.y - z.y) / d * z.speed * dt, z.r, CFG.WORLD_H - z.r);
      }
      if (d < z.range && z.atkTimer <= 0) {
        z.atkTimer = z.atkCd;
        const dx = (p.x - z.x) / d, dy = (p.y - z.y) / d;
        world.enemyProjectiles.push({ x: z.x, y: z.y, vx: dx * z.projSpeed, vy: dy * z.projSpeed, dmg: z.dmg, life: 2 });
      }
    } else {
      const targetGen = z.aggroGen && genActive;
      const tx = targetGen ? obj.genX : p.x, ty = targetGen ? obj.genY : p.y;
      const d = dist(z.x, z.y, tx, ty) || 1;
      z.x = clamp(z.x + (tx - z.x) / d * z.speed * dt, z.r, CFG.WORLD_W - z.r);
      z.y = clamp(z.y + (ty - z.y) / d * z.speed * dt, z.r, CFG.WORLD_H - z.r);
      if (targetGen) {
        if (d < z.r + CFG.GENERATOR_R && z.atkTimer <= 0) { z.atkTimer = z.atkCd; damageGenerator(z.dmg); }
      } else if (d < z.r + p.r && z.atkTimer <= 0) {
        z.atkTimer = z.atkCd;
        damagePlayer(p, z.dmg);
      }
    }
    z.animDist += dist(z.x, z.y, z.px, z.py);
  }
  world.zombies = world.zombies.filter(z => !z.dead);
}

function damagePlayer(p, amt) {
  if (p.invuln > 0 || p.dashing > 0) return;
  p.hp -= amt;
  p.invuln = 0.35;
  playSfx("sfx_player_hurt", 0.55);
  spawnParticles(p.x, p.y, 6, "#e35b4a");
}

function updateBullets(dt) {
  for (const b of world.bullets) {
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.traveled += Math.hypot(b.vx, b.vy) * dt;
    if (b.traveled > b.range || b.x < 0 || b.x > CFG.WORLD_W || b.y < 0 || b.y > CFG.WORLD_H) { b.dead = true; continue; }
    for (const z of world.zombies) {
      if (z.dead || b.dead) continue;
      if (dist(b.x, b.y, z.x, z.y) < z.r + 4) {
        z.hp -= b.dmg;
        z.hitFlash = 0.12;
        spawnParticles(b.x, b.y, 4, "#c0392b");
        if (z.hp <= 0) killZombie(z);
        if (b.pierce > 0) { b.pierce--; } else { b.dead = true; }
      }
    }
  }
  world.bullets = world.bullets.filter(b => !b.dead);
}

function updateEnemyProjectiles(dt, p) {
  for (const pr of world.enemyProjectiles) {
    pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
    if (pr.life <= 0) { pr.dead = true; continue; }
    if (dist(pr.x, pr.y, p.x, p.y) < p.r + 6) { damagePlayer(p, pr.dmg); pr.dead = true; }
  }
  world.enemyProjectiles = world.enemyProjectiles.filter(pr => !pr.dead);
}

function updatePickups(dt, p) {
  const magnet = CFG.PICKUP_RADIUS_BASE * p.magnetMult;
  for (const pk of world.pickups) {
    const d = dist(pk.x, pk.y, p.x, p.y);
    if (d < magnet) {
      const dx = (p.x - pk.x) / (d || 1), dy = (p.y - pk.y) / (d || 1);
      pk.x += dx * CFG.PICKUP_SPEED * dt; pk.y += dy * CFG.PICKUP_SPEED * dt;
    }
    if (d < p.r + 10) {
      pk.dead = true;
      playSfx("sfx_pickup", 0.45);
      if (pk.type === "coin") { /* already added to coins on drop */ }
      else if (pk.type === "health") { p.hp = Math.min(p.maxHp(), p.hp + 25); }
      else if (pk.type === "weapon") { p.weapon = choice(["smg", "shotgun"]); toast(STR[WEAPONS[p.weapon].label]); }
    }
  }
  world.pickups = world.pickups.filter(pk => !pk.dead);
}

function updateParticles(dt) {
  for (const pt of world.particles) {
    pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vx *= 0.9; pt.vy *= 0.9; pt.life -= dt;
  }
  world.particles = world.particles.filter(pt => pt.life > 0);
}

function enterBreak() {
  state = STATE.BREAK;
  world.breakTimer = 6;
  const pool = [...UPGRADE_POOL];
  shuffle(pool);
  world.upgradeChoices = pool.slice(0, 3);
  renderUpgradeCards();
}

function updateBreak(dt) {
  world.breakTimer -= dt;
  if (world.breakTimer <= 0) {
    clearUpgradeCards();
    startWave(world.wave + 1);
  }
}

function applyUpgrade(idx) {
  const u = world.upgradeChoices[idx];
  if (!u) return;
  u.apply(world.player);
  clearUpgradeCards();
  world.breakTimer = Math.min(world.breakTimer, 0.8);
}

let best = parseInt(localStorage.getItem("ws_best") || "0", 10);

function enterEnd(reason) {
  state = STATE.GAMEOVER;
  world.endReason = reason;
  spawnParticles(world.player.x, world.player.y, 20, reason === "complete" ? "#8fae5a" : "#e35b4a");
  let isNew = false;
  if (!world.objective) {
    isNew = world.score > best;
    if (isNew) { best = world.score; localStorage.setItem("ws_best", String(best)); }
  } else if (reason === "complete" && world.levelIndex != null) {
    markLevelComplete(world.levelIndex);
  }
  showEndScreen(reason, isNew);
}

/* ------------------------------------------------------------ render */

function drawGround(ctx) {
  const camX = world.camX, camY = world.camY;
  const left = camX - vw / 2, top = camY - vh / 2;
  if (world.levelBgImage) { drawLevelBackground(world.levelBgImage, left, top); return; }
  const img = images.ground_tile;
  ctx.fillStyle = "#2b2a22";
  ctx.fillRect(0, 0, vw, vh);
  if (img) {
    const t = CFG.TILE;
    const startX = -((left % t) + t) % t;
    const startY = -((top % t) + t) % t;
    for (let x = startX; x < vw; x += t) {
      for (let y = startY; y < vh; y += t) {
        ctx.drawImage(img, x, y, t, t);
      }
    }
  }
  // arena bounds vignette
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 8;
  ctx.strokeRect(-left, -top, CFG.WORLD_W, CFG.WORLD_H);
}

function drawLevelBackground(img, left, top) {
  ctx.fillStyle = "#2b2a22";
  ctx.fillRect(0, 0, vw, vh);
  const scale = Math.max(CFG.WORLD_W / img.width, CFG.WORLD_H / img.height);
  const dw = img.width * scale, dh = img.height * scale;
  const dx = (CFG.WORLD_W - dw) / 2 - left;
  const dy = (CFG.WORLD_H - dh) / 2 - top;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 8;
  ctx.strokeRect(-left, -top, CFG.WORLD_W, CFG.WORLD_H);
}

function worldToScreen(x, y) { return [x - world.camX + vw / 2, y - world.camY + vh / 2]; }

function frameSrcRect(img, frame) {
  const fw = img.width / CFG.ANIM_COLS, fh = img.height / CFG.ANIM_ROWS;
  const col = frame % CFG.ANIM_COLS, row = Math.floor(frame / CFG.ANIM_COLS) % CFG.ANIM_ROWS;
  return [col * fw, row * fh, fw, fh];
}

function drawSprite(img, x, y, size, angle, alpha = 1, flash = 0, frame = null) {
  if (!img) return;
  const [sx, sy] = worldToScreen(x, y);
  if (sx < -size || sx > vw + size || sy < -size || sy > vh + size) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(sx, sy);
  if (angle !== null) ctx.rotate(angle + Math.PI / 2);
  if (frame === null) {
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  } else {
    const [fx, fy, fw, fh] = frameSrcRect(img, frame);
    ctx.drawImage(img, fx, fy, fw, fh, -size / 2, -size / 2, size, size);
  }
  if (flash > 0) {
    ctx.globalAlpha = Math.min(1, flash * 3);
    ctx.globalCompositeOperation = "lighter";
    if (frame === null) {
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
    } else {
      const [fx, fy, fw, fh] = frameSrcRect(img, frame);
      ctx.drawImage(img, fx, fy, fw, fh, -size / 2, -size / 2, size, size);
    }
  }
  ctx.restore();
}

function drawScene() {
  drawGround(ctx);
  const p = world.player;

  for (const pk of world.pickups) {
    const img = images["pickup_" + (pk.type === "weapon" ? "weapon_crate" : pk.type)];
    const bob = Math.sin(world.time * 4 + pk.x) * 4;
    drawSprite(img, pk.x, pk.y + bob, 30, null);
  }

  drawObjectiveMarkers(p);

  for (const z of world.zombies) {
    if (z.dead) continue;
    const img = images[ZTYPES[z.type].img];
    const size = z.boss ? 84 : 46;
    const ang = Math.atan2(p.y - z.y, p.x - z.x);
    const zframe = Math.floor(z.animDist / CFG.ANIM_STRIDE) % CFG.ANIM_FRAMES;
    drawSprite(img, z.x, z.y, size, ang, 1, z.hitFlash, zframe);
    if (z.boss) drawHpBar(z.x, z.y - size / 2 - 10, size, z.hp / z.maxHp);
  }

  for (const b of world.bullets) {
    const [sx, sy] = worldToScreen(b.x, b.y);
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(sx, sy, 4, 0, 7); ctx.fill();
  }
  for (const pr of world.enemyProjectiles) {
    const [sx, sy] = worldToScreen(pr.x, pr.y);
    ctx.fillStyle = "#8fdc4a";
    ctx.beginPath(); ctx.arc(sx, sy, 6, 0, 7); ctx.fill();
  }
  for (const pt of world.particles) {
    const [sx, sy] = worldToScreen(pt.x, pt.y);
    ctx.globalAlpha = Math.max(0, pt.life * 2);
    ctx.fillStyle = pt.color;
    ctx.fillRect(sx - 2, sy - 2, 4, 4);
    ctx.globalAlpha = 1;
  }

  const alpha = p.invuln > 0 ? (Math.sin(world.time * 40) > 0 ? 0.4 : 1) : 1;
  const pframe = Math.floor(p.animDist / CFG.ANIM_STRIDE) % CFG.ANIM_FRAMES;
  drawSprite(images.hero_survivor, p.x, p.y, 48, p.facing, alpha, 0, pframe);

  drawOffscreenIndicators(p);

  if (toastTimer > 0) {
    ctx.globalAlpha = Math.min(1, toastTimer);
    ctx.fillStyle = "#e8b93a";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(toastText, vw / 2, vh * 0.28);
    ctx.globalAlpha = 1;
  }
}

function drawObjectiveMarkers(p) {
  const obj = world.objective;
  if (!obj) return;
  if (obj.type === "keycard") {
    if (obj.phase === "find") drawMarker(images.keycard, obj.keyX, obj.keyY, 34, "#7ad1ff");
    else drawMarker(images.gate, obj.gateX, obj.gateY, 46, "#7ad1ff");
  } else if (obj.type === "repair") {
    drawMarker(images.station, obj.repairX, obj.repairY, 44, "#7ad1ff");
    if (obj.progress > 0) drawHpBar(obj.repairX, obj.repairY - 40, 50, obj.progress / CFG.REPAIR_TIME);
  } else if (obj.type === "defend") {
    drawMarker(images.generator, obj.genX, obj.genY, 56, "#7ad1ff");
    drawHpBar(obj.genX, obj.genY - 44, 60, obj.genHp / CFG.GENERATOR_HP);
  } else if (obj.type === "collect") {
    for (const c of obj.canisters) if (!c.taken) drawMarker(images.fuel_canister, c.x, c.y, 30, "#e8b93a");
    if (obj.extractReady) drawMarker(null, obj.extractX, obj.extractY, 60, "#8fae5a");
  }
}

function drawMarker(img, x, y, size, glowColor) {
  const [sx, sy] = worldToScreen(x, y);
  if (sx < -80 || sx > vw + 80 || sy < -80 || sy > vh + 80) return;
  ctx.save();
  ctx.globalAlpha = 0.55 + Math.sin(world.time * 4) * 0.2;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(sx, sy, size / 2 + 6, 0, 7); ctx.stroke();
  ctx.restore();
  if (img) drawSprite(img, x, y, size, null);
}

function drawHpBar(x, y, w, frac) {
  const [sx, sy] = worldToScreen(x, y);
  ctx.fillStyle = "#241f1a";
  ctx.fillRect(sx - w / 2, sy, w, 6);
  ctx.fillStyle = "#e35b4a";
  ctx.fillRect(sx - w / 2, sy, w * Math.max(0, frac), 6);
}

function drawOffscreenIndicators(p) {
  const margin = 30;
  for (const z of world.zombies) {
    if (z.dead) continue;
    const [sx, sy] = worldToScreen(z.x, z.y);
    if (sx > -20 && sx < vw + 20 && sy > -20 && sy < vh + 20) continue;
    const ang = Math.atan2(sy - vh / 2, sx - vw / 2);
    const ex = clamp(vw / 2 + Math.cos(ang) * (vw / 2 - margin), margin, vw - margin);
    const ey = clamp(vh / 2 + Math.sin(ang) * (vh / 2 - margin), margin, vh - margin);
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(ang);
    ctx.fillStyle = z.boss ? "#e8b93a" : "rgba(232,90,74,0.85)";
    ctx.beginPath();
    ctx.moveTo(8, 0); ctx.lineTo(-6, -6); ctx.lineTo(-6, 6); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/* --------------------------------------------------------------- HUD */

const hpFill = document.getElementById("hpfill");
const hpLabel = document.getElementById("hplabel");
const waveLabel = document.getElementById("wavelabel");
const topRight = document.getElementById("topright");
const dashBtn = document.getElementById("dashbtn");
const objHud = document.getElementById("objhud");

function renderHud() {
  const p = world.player;
  const frac = clamp(p.hp / p.maxHp(), 0, 1);
  hpFill.style.width = (frac * 100) + "%";
  hpLabel.textContent = `${Math.max(0, Math.round(p.hp))} / ${p.maxHp()}`;
  waveLabel.textContent = `${STR.wave} ${world.wave}`;
  topRight.innerHTML = `${STR.coins}: ${world.coins}<br>${STR.score}: ${world.score}`;
  dashBtn.textContent = STR.dash;
  dashBtn.classList.toggle("cd", p.dashCd > 0);
  renderObjectiveHud();
}

function renderObjectiveHud() {
  const obj = world.objective;
  if (!obj) { objHud.style.display = "none"; return; }
  objHud.style.display = "block";
  let text = "";
  if (obj.type === "survive") text = `${STR.objSurvive} ${world.wave} / ${obj.targetWave}`;
  else if (obj.type === "keycard") text = obj.phase === "find" ? STR.objFindKey : STR.objBringGate;
  else if (obj.type === "repair") text = `${STR.objRepair} ${Math.min(100, Math.round(obj.progress / CFG.REPAIR_TIME * 100))}%`;
  else if (obj.type === "defend") text = `${STR.objDefend} ${world.wave} / ${obj.targetWave}`;
  else if (obj.type === "collect") text = obj.extractReady ? STR.objExtract : `${STR.objCollect} ${obj.collected}/${obj.needed}`;
  objHud.textContent = text;
}

/* --------------------------------------------------------- overlays */

const overlay = document.getElementById("overlay");
function setOverlay(html) {
  overlay.innerHTML = html;
  overlay.classList.remove("hidden");
}
function hideOverlay() { overlay.classList.add("hidden"); overlay.innerHTML = ""; }

function showMenu() {
  setOverlay(`
    <div class="panel">
      <h1>${STR.title}</h1>
      <h2>${STR.subtitle}</h2>
      <div class="btn" id="btn-start">${STR.play}</div>
      <div class="small">${STR.best}: ${best}</div>
    </div>`);
  document.getElementById("btn-start").addEventListener("click", showLevelSelect);
}

function showLevelSelect() {
  const completed = getCompletedSet();
  const cards = LEVELS.map((lvl, i) => `
    <div class="lvlcard${completed.has(i) ? " done" : ""}" data-i="${i}">
      ${completed.has(i) ? "✓ " : ""}${lvl.name}
      <span class="lvlobj">${STR["obj_" + lvl.obj]}</span>
    </div>`).join("");
  setOverlay(`
    <div class="panel" style="max-width:94vw;">
      <h1 style="font-size:22px;">${STR.selectMission}</h1>
      <div class="small">${completed.size} / ${LEVELS.length} ${STR.completedMissions}</div>
      <div class="btn" id="btn-endless" style="margin:10px 0;">${STR.endlessMode}</div>
      <div id="lvlgrid">${cards}</div>
    </div>`);
  document.getElementById("btn-endless").addEventListener("click", startEndless);
  overlay.querySelectorAll(".lvlcard").forEach(el => {
    el.addEventListener("click", () => startMission(parseInt(el.dataset.i, 10)));
  });
}

function showEndScreen(reason, isNew) {
  const mission = !!world.objective;
  let title;
  if (reason === "died") title = STR.gameOver;
  else if (reason === "complete") title = STR.missionComplete;
  else if (world.objective && world.objective.type === "defend" && world.objective.genHp <= 0) title = STR.stationDestroyed;
  else title = STR.missionFailed;

  const statsHtml = !mission ? `
      <div class="small" style="font-size:16px;color:#e8e2d6;margin-bottom:4px;">${STR.finalScore}: ${world.score}</div>
      <div class="small" style="font-size:16px;color:#e8e2d6;">${STR.wavesSurvived}: ${world.wave}</div>
      ${isNew ? `<div class="small" style="color:#e8b93a;font-weight:bold;">${STR.newBest}</div>` : ""}` : "";

  let buttons;
  if (!mission) {
    buttons = `<div class="btn" id="btn-restart">${STR.restart}</div>`;
  } else if (reason === "complete") {
    const hasNext = world.levelIndex + 1 < LEVELS.length;
    buttons = (hasNext ? `<div class="btn" id="btn-next">${STR.nextLevel}</div>` : "") +
      `<div class="btn" id="btn-select" style="margin-left:8px;">${STR.backToSelect}</div>`;
  } else {
    buttons = `<div class="btn" id="btn-retry">${STR.retryMission}</div>` +
      `<div class="btn" id="btn-select" style="margin-left:8px;">${STR.backToSelect}</div>`;
  }

  setOverlay(`<div class="panel"><h1>${title}</h1>${statsHtml}${buttons}</div>`);

  if (!mission) {
    document.getElementById("btn-restart").addEventListener("click", startEndless);
  } else {
    const nextEl = document.getElementById("btn-next");
    if (nextEl) nextEl.addEventListener("click", () => startMission(world.levelIndex + 1));
    const retryEl = document.getElementById("btn-retry");
    if (retryEl) retryEl.addEventListener("click", () => startMission(world.levelIndex));
    document.getElementById("btn-select").addEventListener("click", showLevelSelect);
  }
}

function renderUpgradeCards() {
  const items = world.upgradeChoices.map((u, i) =>
    `<div class="card" data-i="${i}">${STR[u.str]}</div>`).join("");
  setOverlay(`
    <div class="panel">
      <h1 style="font-size:22px;">${STR.waveClear}</h1>
      <h2>${STR.chooseUpgrade}</h2>
      <div id="upgrades">${items}</div>
    </div>`);
  overlay.querySelectorAll(".card").forEach(el => {
    el.addEventListener("click", () => applyUpgrade(parseInt(el.dataset.i, 10)));
  });
}
function clearUpgradeCards() { hideOverlay(); }

function showPaused() {
  setOverlay(`
    <div class="panel">
      <h1 style="font-size:24px;">${STR.paused}</h1>
      <div class="btn" id="btn-resume">${STR.resume}</div>
    </div>`);
  document.getElementById("btn-resume").addEventListener("click", togglePause);
}

function togglePause() {
  if (state === STATE.PAUSED) {
    state = prevStateBeforePause;
    hideOverlay();
  } else if (state === STATE.PLAYING || state === STATE.BREAK) {
    prevStateBeforePause = state;
    state = STATE.PAUSED;
    showPaused();
  }
}
document.getElementById("pausebtn").addEventListener("click", togglePause);
document.getElementById("mutebtn").addEventListener("click", () => setMuted(!muted));
addEventListener("blur", () => { if (state === STATE.PLAYING || state === STATE.BREAK) togglePause(); });

function startEndless() {
  rng = mulberry32((Date.now() ^ 0x9e3779b9) & 0xffffffff);
  resetWorld();
  hideOverlay();
  if (!muted && musicEl) musicEl.play().catch(() => {});
  startWave(1);
}

function startMission(idx) {
  const lvl = LEVELS[idx];
  rng = mulberry32((Date.now() ^ 0x9e3779b9 ^ idx) & 0xffffffff);
  resetWorld();
  world.levelIndex = idx;
  world.objective = makeObjective(lvl);
  loadLevelImage(lvl.img).then(img => { if (world && world.levelIndex === idx) world.levelBgImage = img; });
  hideOverlay();
  if (!muted && musicEl) musicEl.play().catch(() => {});
  startWave(1);
}

/* ------------------------------------------------------------- loop */

const devEl = document.getElementById("dev");
const devOn = new URLSearchParams(location.search).has("dev");
if (devOn) devEl.style.display = "block";

let acc = 0, last = performance.now(), frames = 0, fpsAt = last, fps = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dtRaw = Math.min(now - last, 250);
  last = now;
  acc += dtRaw;
  let steps = 0;
  while (acc >= STEP * 1000 && steps < 8) {
    if (state === STATE.PLAYING || state === STATE.BREAK) update(STEP);
    else if (world) updateParticles(STEP);
    acc -= STEP * 1000;
    steps++;
  }

  ctx.clearRect(0, 0, vw, vh);
  if (state === STATE.MENU) {
    if (images.title_background) ctx.drawImage(images.title_background, 0, 0, vw, vh);
    else { ctx.fillStyle = "#0f1117"; ctx.fillRect(0, 0, vw, vh); }
  } else {
    drawScene();
    renderHud();
  }

  if (devOn && (frames++, now - fpsAt >= 500)) {
    fps = Math.round((frames * 1000) / (now - fpsAt)); frames = 0; fpsAt = now;
    devEl.textContent = `${fps} fps  z:${world ? world.zombies.length : 0}  b:${world ? world.bullets.length : 0}`;
  }
}

/* ------------------------------------------------------------- boot */

(function boot() {
  document.querySelector("#panel-menu h1").textContent = STR.title;
  document.querySelector("#panel-menu h2").textContent = STR.subtitle;
  document.getElementById("btn-start").textContent = "Loading…";
  document.getElementById("menu-best").textContent = "";
  setMuted(muted);

  loadAssets(frac => {
    const b = document.getElementById("btn-start");
    if (b) b.textContent = `Loading… ${Math.round(frac * 100)}%`;
  }).then(() => {
    showMenu();
    requestAnimationFrame(frame);
  });
})();
