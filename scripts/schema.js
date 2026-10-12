/**
 * Theme-Schema: welche Werte ein Theme enthält, Standardwerte und Hilfsfunktionen.
 */

export const MODULE_ID = "ascandir-argon-combat-hud-themer";
export const SCHEMA_VERSION = 1;

/** Argon-Farbvariablen (--ech-<key>), gruppiert für den Editor. Standardwerte = Argon-Original. */
export const ARGON_COLOR_GROUPS = [
  {
    id: "portrait",
    fields: [
      ["portrait-base-background", "#414b55e6"],
      ["portrait-base-color", "#b4d2dcff"],
      ["portrait-base-border", "#757f89ff"],
    ],
  },
  {
    id: "mainAction",
    fields: [
      ["mainAction-background-color", "#0000004d"],
      ["mainAction-base-background", "#414b55e6"],
      ["mainAction-base-color", "#b4d2dcff"],
      ["mainAction-base-border", "#757f89ff"],
      ["mainAction-hover-background", "#747e88e6"],
      ["mainAction-hover-color", "#b4d2dcff"],
      ["mainAction-hover-border", "#757f89ff"],
    ],
  },
  {
    id: "bonusAction",
    fields: [
      ["bonusAction-base-background", "#453b75e6"],
      ["bonusAction-base-color", "#b4d2dcff"],
      ["bonusAction-base-border", "#757f89ff"],
      ["bonusAction-hover-background", "#9288c2e6"],
      ["bonusAction-hover-color", "#b4d2dcff"],
      ["bonusAction-hover-border", "#757f89ff"],
    ],
  },
  {
    id: "freeAction",
    fields: [
      ["freeAction-base-background", "#3b5875e6"],
      ["freeAction-base-color", "#b4d2dcff"],
      ["freeAction-base-border", "#757f89ff"],
      ["freeAction-hover-background", "#88a5c2e6"],
      ["freeAction-hover-color", "#b4d2dcff"],
      ["freeAction-hover-border", "#757f89ff"],
    ],
  },
  {
    id: "reaction",
    fields: [
      ["reaction-base-background", "#753b3be6"],
      ["reaction-base-color", "#b4d2dcff"],
      ["reaction-base-border", "#757f89ff"],
      ["reaction-hover-background", "#c28888e6"],
      ["reaction-hover-color", "#b4d2dcff"],
      ["reaction-hover-border", "#757f89ff"],
    ],
  },
  {
    id: "endTurn",
    fields: [
      ["endTurn-base-background", "#374b3ce6"],
      ["endTurn-base-color", "#b4d2dcff"],
      ["endTurn-base-border", "#757f89ff"],
      ["endTurn-hover-background", "#849889e6"],
      ["endTurn-hover-color", "#b4d2dcff"],
      ["endTurn-hover-border", "#757f89ff"],
    ],
  },
  {
    id: "tooltip",
    fields: [
      ["tooltip-header-background", "#ffffffcc"],
      ["tooltip-header-color", "#414146ff"],
      ["tooltip-header-border", "#757f89ff"],
      ["tooltip-subtitle-background", "#32505aff"],
      ["tooltip-subtitle-color", "#ffffffff"],
      ["tooltip-subtitle-border", "#757f89ff"],
      ["tooltip-body-background", "#5a7896b3"],
      ["tooltip-body-color", "#ffffffff"],
      ["tooltip-body-border", "#757f89ff"],
    ],
  },
  {
    id: "abilityMenu",
    fields: [
      ["abilityMenu-background", "#414b55e6"],
      ["abilityMenu-color", "#b4d2dcff"],
      ["abilityMenu-border", "#757f89ff"],
      ["abilityMenu-base-color", "#b4d2dcff"],
      ["abilityMenu-base-boxShadow", "#757f89cc"],
      ["abilityMenu-hover-color", "#b4d2dcff"],
      ["abilityMenu-hover-boxShadow", "#757f89cc"],
    ],
  },
  {
    id: "buttons",
    fields: [
      ["buttons-base-background", "#5096c3ff"],
      ["buttons-base-color", "#ffffffff"],
      ["buttons-base-border", "#5096c3ff"],
      ["buttons-hover-background", "#55bef5ff"],
      ["buttons-hover-color", "#ffffffff"],
      ["buttons-hover-border", "#55bef5ff"],
    ],
  },
  {
    id: "movement",
    fields: [
      ["movement-used-background", "#7d879180"],
      ["movement-used-boxShadow", "#00000000"],
      ["movement-baseMovement-background", "#5abef5ff"],
      ["movement-baseMovement-boxShadow", "#6ed2ffcc"],
      ["movement-dashMovement-background", "#c8c85aff"],
      ["movement-dashMovement-boxShadow", "#dcdc6ecc"],
      ["movement-dangerMovement-background", "#c85f5aff"],
      ["movement-dangerMovement-boxShadow", "#dc736ecc"],
    ],
  },
];

/**
 * Zusatzfarben, die Argon fest im CSS hat (nicht über seinen eigenen Editor änderbar).
 * Der Themer überschreibt sie gezielt.
 */
export const EXTRA_COLOR_FIELDS = [
  ["accent", "#5abef5ff"],        // Werte von RK, SG, aktueller Bewegung
  ["hp", "#00ffaaff"],            // aktuelle Trefferpunkte
  ["pip", "#b4d2e1ff"],           // Aktions-Punkte & Zauberplätze (verfügbar)
  ["pipGlow", "#c8e6f5cc"],       // Leuchten der Punkte
  ["pipUsed", "#78829180"],       // Aktions-Punkte & Zauberplätze (verbraucht)
  ["statText", "#ffffffff"],      // Text in Werte-Kästen, Rast-Knöpfen, Waffensets
  ["statBackground", "#00000080"],// Hintergrund der Werte-Kästen, Rast-Knöpfe, Waffensets
  ["panelText", "#c8c8c8ff"],     // Überschriften der Aktionsleisten / Zauber-Akkordeon
  ["headerBg", "#24180cff"],      // Kopfleisten im verzierten Attribute-Menü
  ["highlight", "#00000026"],     // Hervorhebung geübter Fertigkeiten
  ["iconTint", "#e8d3a0ff"],      // Tönung der Aktionssymbole / Medaillon-Symbole
  ["hpBox", "#7a1018ff"],         // Hintergrund des HP-Kastens (farbige Werte-Kästen)
  ["accentBox", "#0f2c48ff"],     // Hintergrund der Zahlen bei RK / SG (farbige Werte-Kästen)
];

export const ALL_COLOR_KEYS = [
  ...ARGON_COLOR_GROUPS.flatMap((g) => g.fields.map(([k]) => k)),
];

export function defaultArgonColors() {
  return Object.fromEntries(ARGON_COLOR_GROUPS.flatMap((g) => g.fields));
}

export function defaultExtraColors() {
  return Object.fromEntries(EXTRA_COLOR_FIELDS);
}

/** Ein komplettes Theme mit Argon-Originalwerten. */
export function defaultTheme() {
  return {
    schema: SCHEMA_VERSION,
    id: "",
    name: "",
    colors: defaultArgonColors(),
    extras: defaultExtraColors(),
    style: {
      font: "",            // leer = Argon-Schrift beibehalten
      headingFont: "",     // Schrift für Überschriften (Kopfleisten, Leisten-Beschriftungen, Tooltip-Titel, Name)
      fontScale: 100,      // Prozent, wirkt auf den Text im HUD
      radius: 0,           // Eckenrundung in px
      borderWidth: 1,      // Rahmenstärke in px
      hoverGlow: false,
      glowColor: "#ffffffaa",
      glowSize: 12,
      textShadow: false,
      portraitFrame: false,  // farbiger Rahmen um das Portrait
      skillIcons: false,     // Symbole vor Attributen & Fertigkeiten (Menü + Tooltip)
      ornateMenu: false,     // verziertes Attribute-/Fertigkeitenmenü (Kopfleisten, Spaltenlinien)
      squarePips: false,     // eckige Zauberplatz-Punkte
      titleStrip: false,     // dunkler Verlauf hinter den Knopf-Beschriftungen
      tooltipTitleLeft: false, // Tooltip-Titel linksbündig mit Symbol
      joinedStats: false,    // HP / RK / SG als eine durchgehende Leiste
      continuousBar: false,  // Aktionsleisten als durchgehende Planke mit innenliegender Beschriftung
      hideName: false,       // Name & Stufe am Portrait ausblenden (Zustände bleiben sichtbar)
      abilityMedallions: false, // Attribut-Symbole als runde Medaillons
      highlightProficient: false, // geübte Fertigkeiten hervorheben
      tintIcons: false,      // weiße Aktionssymbole einfärben (Farbe „Tönung der Symbole“)
      statBoxColors: false,  // HP-Kasten und RK/SG-Zahlen farbig hinterlegen
      tooltipDivider: false, // Trennlinie unter dem Tooltip-Titel
    },
    textures: {
      panel: "",           // Textur für Leisten & Kästen (kachelt)
      panelSize: 256,      // Kachelgröße in px
      tooltip: "",         // Hintergrund der Tooltips (gestreckt)
      frame: "",           // Zierrahmen für Portrait, Attribute-Menü, Tooltip (9-Slice)
      frameSlice: 40,
      frameWidth: 16,
      frameImageWidth: 0,  // 0 = wie Rahmenbreite; größer = Ecken ragen nach innen
      frameOutset: 0,      // Überstand nach außen in px
      frameRepeat: "stretch", // "stretch" oder "round" (Kanten wiederholen statt strecken)
      menuPanel: "",       // eigene Textur für Menü, Rast-Knöpfe, Werteleiste (sonst wie Leisten)
      tooltipFrame: "",    // eigener Rahmen nur für Tooltips (sonst Zierrahmen)
      tooltipFrameSlice: 30,
      tooltipFrameWidth: 16,
      tooltipFrameImageWidth: 0,  // 0 = wie Rahmenbreite; größer = Ecken ragen nach innen
      tooltipFrameOutset: 0,      // Überstand nach außen in px
      barFrame: "",        // Rahmen um die durchgehende Aktionsplanke
      barFrameSlice: 40,
      barFrameWidth: 16,
      barFrameImageWidth: 0,  // 0 = wie Rahmenbreite; größer = Ecken ragen nach innen
      barFrameOutset: 0,      // Überstand nach außen in px
      buttonFrame: "",     // Rahmen für Aktions-/Zauber-Knöpfe (9-Slice)
      buttonFrameSlice: 12,
      buttonFrameWidth: 6,
      buttonFrameImageWidth: 0,  // 0 = wie Rahmenbreite; größer = Ecken ragen nach innen
      buttonFrameOutset: 0,      // Überstand nach außen in px
      seal: "",            // Deko-Bild oben rechts am Tooltip
      headerOrnament: "",  // Zierelement in den Kopfleisten des Attribute-Menüs
      slotFlourish: "",    // Zierpfeil links/rechts vom ∞ der Zaubertricks
      medallion: "",       // Bild für die Attribut-Medaillons (rund, Mitte frei)
      tooltipDrape: "",    // Stoff/Deko hinter dem Tooltip (unten links)
    },
    ornaments: [],         // frei platzierte Deko-Bilder (Laternen, Banner …)
    customCss: "",
  };
}

export const MAX_ORNAMENTS = 16;
export const ORNAMENT_ANCHORS = ["portrait", "abilityMenu", "buttonHud", "weaponSets", "movement", "actionFirst", "actionLast", "hud"];
export const ORNAMENT_CORNERS = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];
export const ORNAMENT_ANIMATIONS = ["none", "flicker", "sway"];

export function defaultOrnament() {
  return { src: "", anchor: "portrait", corner: "top-right", x: 0, y: 0, width: 80, height: 80, layer: "front", animation: "none", flip: false };
}

export function normalizeOrnament(o = {}) {
  const d = defaultOrnament();
  return {
    src: cleanPath(o.src),
    anchor: ORNAMENT_ANCHORS.includes(o.anchor) ? o.anchor : d.anchor,
    corner: ORNAMENT_CORNERS.includes(o.corner) ? o.corner : d.corner,
    x: clampNumber(o.x, -1000, 1000, 0),
    y: clampNumber(o.y, -1000, 1000, 0),
    width: clampNumber(o.width, 4, 1000, d.width),
    height: clampNumber(o.height, 4, 1000, d.height),
    layer: ["back", "middle"].includes(o.layer) ? o.layer : "front",
    animation: ORNAMENT_ANIMATIONS.includes(o.animation) ? o.animation : "none",
    flip: !!o.flip,
  };
}

/** Bereinigt einen Bildpfad, damit er gefahrlos in url("...") steht. */
export function cleanPath(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/["\\\n\r<>]/g, "").slice(0, 500);
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Wandelt beliebige Hex-Farben in #rrggbbaa um. Ungültiges -> fallback. */
export function toHex8(value, fallback = "#000000ff") {
  if (typeof value !== "string") return fallback;
  let v = value.trim().toLowerCase();
  if (!HEX_RE.test(v)) {
    const parsed = parseCssColor(v);
    return parsed ?? fallback;
  }
  v = v.slice(1);
  if (v.length === 3 || v.length === 4) v = [...v].map((c) => c + c).join("");
  if (v.length === 6) v += "ff";
  return `#${v}`;
}

let _ctx;
/** Liest jede CSS-Farbe (rgb(), Namen …) über ein Canvas aus. */
function parseCssColor(value) {
  try {
    _ctx ??= document.createElement("canvas").getContext("2d");
    _ctx.fillStyle = "#010203";
    _ctx.fillStyle = value;
    const out = _ctx.fillStyle;
    if (out === "#010203" && value !== "#010203") return null;
    if (out.startsWith("#")) return out.toLowerCase() + "ff";
    const m = out.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = "1"] = m[1].split(/[ ,/]+/).filter(Boolean);
    const hex = (n) => Math.round(Math.max(0, Math.min(255, Number(n)))).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}${hex(Number(a) * 255)}`;
  } catch {
    return null;
  }
}

function clampNumber(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Bringt (auch importierte oder ältere) Theme-Daten in eine saubere, vollständige Form. */
export function normalizeTheme(data = {}) {
  const base = defaultTheme();
  const theme = {
    schema: SCHEMA_VERSION,
    id: String(data.id ?? ""),
    name: String(data.name ?? "").slice(0, 80),
    colors: {},
    extras: {},
    style: { ...base.style },
    textures: { ...base.textures },
    ornaments: [],
    customCss: typeof data.customCss === "string" ? data.customCss : "",
  };

  // Argon-Export-Format ({ colors: { portrait: { base: {...} } } }) wird ebenfalls akzeptiert
  let colors = data.colors ?? {};
  if (Object.values(colors).some((v) => v && typeof v === "object")) {
    colors = foundry.utils.flattenObject(colors);
    colors = Object.fromEntries(Object.entries(colors).map(([k, v]) => [k.replace(/\./g, "-"), v]));
  }
  for (const [key, def] of Object.entries(base.colors)) theme.colors[key] = toHex8(colors[key], def);
  for (const [key, def] of Object.entries(base.extras)) theme.extras[key] = toHex8(data.extras?.[key], def);

  const s = data.style ?? {};
  theme.style.font = typeof s.font === "string" ? s.font.slice(0, 80) : "";
  theme.style.headingFont = typeof s.headingFont === "string" ? s.headingFont.slice(0, 80) : "";
  theme.style.fontScale = clampNumber(s.fontScale, 70, 150, 100);
  theme.style.radius = clampNumber(s.radius, 0, 40, 0);
  theme.style.borderWidth = clampNumber(s.borderWidth, 0, 8, 1);
  theme.style.hoverGlow = !!s.hoverGlow;
  theme.style.glowColor = toHex8(s.glowColor, base.style.glowColor);
  theme.style.glowSize = clampNumber(s.glowSize, 0, 40, 12);
  theme.style.textShadow = !!s.textShadow;
  theme.style.portraitFrame = !!s.portraitFrame;
  theme.style.skillIcons = !!s.skillIcons;
  theme.style.ornateMenu = !!s.ornateMenu;
  theme.style.squarePips = !!s.squarePips;
  theme.style.titleStrip = !!s.titleStrip;
  theme.style.tooltipTitleLeft = !!s.tooltipTitleLeft;
  theme.style.joinedStats = !!s.joinedStats;
  theme.style.continuousBar = !!s.continuousBar;
  theme.style.hideName = !!s.hideName;
  for (const k of ["abilityMedallions", "highlightProficient", "tintIcons", "statBoxColors", "tooltipDivider"]) theme.style[k] = !!s[k];

  const tx = data.textures ?? {};
  theme.textures = {
    panel: cleanPath(tx.panel),
    panelSize: clampNumber(tx.panelSize, 32, 1024, base.textures.panelSize),
    tooltip: cleanPath(tx.tooltip),
    frame: cleanPath(tx.frame),
    frameSlice: clampNumber(tx.frameSlice, 1, 500, base.textures.frameSlice),
    frameWidth: clampNumber(tx.frameWidth, 1, 64, base.textures.frameWidth),
    frameImageWidth: clampNumber(tx.frameImageWidth, 0, 400, 0),
    frameOutset: clampNumber(tx.frameOutset, 0, 200, 0),
    frameRepeat: tx.frameRepeat === "round" ? "round" : "stretch",
    menuPanel: cleanPath(tx.menuPanel),
    tooltipFrame: cleanPath(tx.tooltipFrame),
    tooltipFrameSlice: clampNumber(tx.tooltipFrameSlice, 1, 500, base.textures.tooltipFrameSlice),
    tooltipFrameWidth: clampNumber(tx.tooltipFrameWidth, 1, 64, base.textures.tooltipFrameWidth),
    tooltipFrameImageWidth: clampNumber(tx.tooltipFrameImageWidth, 0, 400, 0),
    tooltipFrameOutset: clampNumber(tx.tooltipFrameOutset, 0, 200, 0),
    barFrame: cleanPath(tx.barFrame),
    barFrameSlice: clampNumber(tx.barFrameSlice, 1, 500, base.textures.barFrameSlice),
    barFrameWidth: clampNumber(tx.barFrameWidth, 1, 64, base.textures.barFrameWidth),
    barFrameImageWidth: clampNumber(tx.barFrameImageWidth, 0, 400, 0),
    barFrameOutset: clampNumber(tx.barFrameOutset, 0, 200, 0),
    buttonFrame: cleanPath(tx.buttonFrame),
    buttonFrameSlice: clampNumber(tx.buttonFrameSlice, 1, 500, base.textures.buttonFrameSlice),
    buttonFrameWidth: clampNumber(tx.buttonFrameWidth, 1, 32, base.textures.buttonFrameWidth),
    buttonFrameImageWidth: clampNumber(tx.buttonFrameImageWidth, 0, 400, 0),
    buttonFrameOutset: clampNumber(tx.buttonFrameOutset, 0, 200, 0),
    seal: cleanPath(tx.seal),
    headerOrnament: cleanPath(tx.headerOrnament),
    slotFlourish: cleanPath(tx.slotFlourish),
    medallion: cleanPath(tx.medallion),
    tooltipDrape: cleanPath(tx.tooltipDrape),
  };

  const list = Array.isArray(data.ornaments) ? data.ornaments : Object.values(data.ornaments ?? {});
  theme.ornaments = list.slice(0, MAX_ORNAMENTS).map(normalizeOrnament);
  return theme;
}

/** "#rrggbbaa" -> { rgb: "#rrggbb", alpha: 0..100 } */
export function splitHex8(hex8) {
  const h = toHex8(hex8);
  return { rgb: h.slice(0, 7), alpha: Math.round((parseInt(h.slice(7, 9), 16) / 255) * 100) };
}

export function joinHex8(rgb, alpha) {
  const a = Math.round((clampNumber(alpha, 0, 100, 100) / 100) * 255).toString(16).padStart(2, "0");
  return `${toHex8(rgb).slice(0, 7)}${a}`;
}
