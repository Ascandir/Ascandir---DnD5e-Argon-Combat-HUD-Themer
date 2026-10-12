/**
 * Deko-Elemente (Laternen, Banner, Wappen …) und Symbole im Attribute-Menü.
 * Argon baut seine Teile bei jeder Änderung neu auf; nach jedem Teil-Render
 * ruft es den Hook "render<Klasse>ArgonComponent" auf. Dort hängen wir unsere
 * Elemente wieder ein, ohne Argon selbst zu verändern.
 */

const ROOT = ".extended-combat-hud";

let theme = null;
let scheduled = false;
let tooltipObserver = null;

/** Wo eine Deko hängen kann (alle Ziele sind bei Argon bereits positioniert). */
const ANCHORS = {
  hud: (r) => r,
  portrait: (r) => r.querySelector(":scope > .portrait-hud"),
  abilityMenu: (r) => r.querySelector(":scope > .ability-menu"),
  buttonHud: (r) => [...r.querySelectorAll(":scope > .movement-hud")].find((e) => e.querySelector(".button-hud-button")),
  movement: (r) => [...r.querySelectorAll(":scope > .movement-hud")].find((e) => !e.querySelector(".button-hud-button")),
  weaponSets: (r) => r.querySelector(":scope > .weapon-sets"),
  actionFirst: (r) => visibleActionPanels(r)[0],
  actionLast: (r) => visibleActionPanels(r).at(-1),
};

function visibleActionPanels(root) {
  return [...root.querySelectorAll(".action-hud > .actions-container")].filter((e) => !e.classList.contains("hidden"));
}

/* -------------------------------------------- */
/*  Symbole für Attribute & Fertigkeiten        */
/* -------------------------------------------- */

const ICONS = {
  // Attribute
  str: "fa-hand-fist", dex: "fa-feather-pointed", con: "fa-heart", int: "fa-book-open", wis: "fa-eye", cha: "fa-sun",
  // Fertigkeiten
  acr: "fa-person-running", ani: "fa-paw", arc: "fa-burst", ath: "fa-arrows-rotate", dec: "fa-masks-theater",
  his: "fa-building-columns", ins: "fa-eye", itm: "fa-skull", inv: "fa-magnifying-glass", med: "fa-leaf",
  nat: "fa-leaf", prc: "fa-eye", prf: "fa-masks-theater", per: "fa-comment", rel: "fa-hands-praying",
  slt: "fa-hand-sparkles", ste: "fa-user-ninja", sur: "fa-campground",
};

let labelMap = null;
const norm = (t) => String(t ?? "").replace(/\s+/g, " ").trim().toLowerCase();

/** Übersetzte Namen -> Kürzel (z. B. "akrobatik" -> "acr"). */
function getLabelMap() {
  if (labelMap) return labelMap;
  labelMap = new Map();
  const add = (cfg) => {
    for (const [key, v] of Object.entries(cfg ?? {})) {
      if (!ICONS[key]) continue;
      const label = typeof v === "string" ? v : v?.label;
      if (label) labelMap.set(norm(game.i18n.localize(label)), key);
    }
  };
  add(CONFIG.DND5E?.abilities);
  add(CONFIG.DND5E?.skills);
  return labelMap;
}

const ABILITY_KEYS = new Set(["str", "dex", "con", "int", "wis", "cha"]);

function keyFor(text) {
  return getLabelMap().get(norm(text)) ?? null;
}

function iconFor(text) {
  const key = keyFor(text);
  return key ? ICONS[key] : null;
}

function makeIcon(cls, ability = false) {
  const i = document.createElement("i");
  i.className = `fa-solid ${cls} asc-skill-icon${ability ? " asc-ability-icon" : ""}`;
  i.setAttribute("aria-hidden", "true");
  return i;
}

function syncMenuIcons(root) {
  const menu = root.querySelector(":scope > .ability-menu");
  if (!menu) return;
  const withIcons = !!theme?.style.skillIcons;
  if (!withIcons) menu.querySelectorAll(".asc-skill-icon").forEach((e) => e.remove());
  for (const li of menu.querySelectorAll("li")) {
    if (li.classList.contains("ability-title")) continue;
    const span = li.querySelector(":scope > span");
    if (!span) continue;
    // Geübte Fertigkeiten markieren (Haken, Doppelhaken = Expertise)
    const prof = span.querySelector(":scope > i:not(.asc-skill-icon)");
    li.classList.toggle("asc-proficient", !!prof?.matches(".fa-check, .fa-check-double"));
    if (!withIcons || span.querySelector(".asc-skill-icon")) continue;
    const key = keyFor(span.textContent);
    if (!key || !ICONS[key]) continue;
    const ability = ABILITY_KEYS.has(key);
    li.classList.toggle("asc-row-ability", ability);
    // Symbol hinter den Übungs-Kreis/-Haken setzen, sonst an den Anfang
    if (prof) prof.after(makeIcon(ICONS[key], ability));
    else span.prepend(makeIcon(ICONS[key], ability));
  }
}

function syncTooltipIcon() {
  const tip = document.querySelector(".ech-tooltip-container .ech-tooltip");
  if (!tip) return;
  const h2 = tip.querySelector(".ech-tooltip-header h2");
  if (!h2) return;
  const existing = h2.querySelector(".asc-skill-icon");
  if (!theme?.style.skillIcons) return existing?.remove();
  if (existing) return;
  const cls = iconFor(h2.textContent);
  if (cls) h2.prepend(makeIcon(cls));
}

function watchTooltip() {
  const el = game.tooltip?.tooltip ?? document.getElementById("tooltip");
  if (!el || tooltipObserver) return;
  tooltipObserver = new MutationObserver(() => syncTooltipIcon());
  tooltipObserver.observe(el, { childList: true });
}

/* -------------------------------------------- */
/*  Deko-Elemente                               */
/* -------------------------------------------- */

function ornamentKey(o, i) {
  return `${i}|${o.src}|${o.anchor}|${o.corner}|${o.x}|${o.y}|${o.width}|${o.height}|${o.layer}|${o.animation}|${o.flip ? 1 : 0}`;
}

function placeStyle(o) {
  const st = {
    position: "absolute",
    width: `${o.width}px`,
    height: `${o.height}px`,
    // hinten: hinter dem Bild · Mitte: über dem Bild, unter Name/Werten · vorne: über allem
    zIndex: o.layer === "back" ? "-1" : o.layer === "middle" ? "0" : "50",
  };
  const [v, h] = o.corner.split("-");
  if (v === "top") st.top = `${o.y}px`;
  else st.bottom = `${o.y}px`;
  if (h === "left") st.left = `${o.x}px`;
  else if (h === "right") st.right = `${o.x}px`;
  else {
    st.left = "50%";
    st.marginLeft = `${o.x - o.width / 2}px`;
  }
  return st;
}

function buildOrnament(o, key) {
  const el = document.createElement("div");
  el.className = `asc-ornament asc-anim-${o.animation}`;
  el.dataset.ascKey = key;
  Object.assign(el.style, placeStyle(o));
  if (o.flip) el.style.scale = "-1 1";
  let href = o.src;
  try { href = new URL(o.src, document.baseURI).href; } catch { /* unverändert */ }
  el.style.backgroundImage = `url("${href.replace(/["\\]/g, "")}")`;
  return el;
}

function syncOrnaments(root) {
  const wanted = new Map();
  (theme?.ornaments ?? []).forEach((o, i) => {
    if (o.src) wanted.set(ornamentKey(o, i), o);
  });

  // Veraltete entfernen
  for (const el of root.querySelectorAll(".asc-ornament")) {
    const o = wanted.get(el.dataset.ascKey);
    const anchor = o && ANCHORS[o.anchor]?.(root);
    if (!o || el.parentElement !== anchor) el.remove();
  }
  // Fehlende ergänzen
  for (const [key, o] of wanted) {
    const anchor = ANCHORS[o.anchor]?.(root);
    if (!anchor) continue;
    if (anchor.querySelector(`:scope > .asc-ornament[data-asc-key="${CSS.escape(key)}"]`)) continue;
    anchor.appendChild(buildOrnament(o, key));
  }
}

/* -------------------------------------------- */
/*  Steuerung                                   */
/* -------------------------------------------- */

function syncAll() {
  scheduled = false;
  for (const root of document.querySelectorAll(ROOT)) {
    syncOrnaments(root);
    syncMenuIcons(root);
  }
  syncTooltipIcon();
}

export function scheduleDecorSync() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(syncAll);
}

export function setDecorTheme(t) {
  theme = t;
  scheduleDecorSync();
}

const COMPONENTS = [
  "PortraitPanel", "DrawerPanel", "DrawerButton", "ActionPanel", "MovementHud",
  "WeaponSets", "ButtonHud", "ButtonPanel", "AccordionPanel", "ArgonComponent",
];

export function registerDecorHooks() {
  for (const name of COMPONENTS) Hooks.on(`render${name}ArgonComponent`, scheduleDecorSync);
  Hooks.on("renderCoreHud", scheduleDecorSync);
  Hooks.once("ready", () => {
    labelMap = null;
    watchTooltip();
    scheduleDecorSync();
  });
}
