/**
 * Mitgelieferte Ascandir-Themes. Sie sind schreibgeschützt;
 * zum Anpassen im Editor "Duplizieren" verwenden.
 */
import { MODULE_ID, defaultTheme, normalizeTheme } from "./schema.js";

const ASSETS = `modules/${MODULE_ID}/assets`;

/** Baut aus einer kleinen Palette alle Argon-Farben. */
function palette(p) {
  const text = p.text;
  const border = p.border;
  const pair = (bg, hover, txt = text, brd = border, hoverBrd = p.hoverBorder ?? brd) => ({
    base: { background: bg, color: txt, border: brd },
    hover: { background: hover, color: p.hoverText ?? txt, border: hoverBrd },
  });
  const flat = {};
  const put = (prefix, obj) => {
    for (const [state, vals] of Object.entries(obj)) {
      for (const [prop, val] of Object.entries(vals)) flat[`${prefix}-${state}-${prop}`] = val;
    }
  };
  flat["portrait-base-background"] = p.portrait ?? p.panel;
  flat["portrait-base-color"] = text;
  flat["portrait-base-border"] = p.portraitBorder ?? border;
  flat["mainAction-background-color"] = p.container;
  put("mainAction", pair(p.panel, p.panelHover));
  put("bonusAction", pair(p.bonus, p.bonusHover));
  put("freeAction", pair(p.free, p.freeHover));
  put("reaction", pair(p.reaction, p.reactionHover));
  put("endTurn", pair(p.endTurn, p.endTurnHover));
  Object.assign(flat, {
    "tooltip-header-background": p.ttHeader,
    "tooltip-header-color": p.ttHeaderText,
    "tooltip-header-border": border,
    "tooltip-subtitle-background": p.ttSubtitle,
    "tooltip-subtitle-color": p.ttSubtitleText,
    "tooltip-subtitle-border": border,
    "tooltip-body-background": p.ttBody,
    "tooltip-body-color": p.ttBodyText,
    "tooltip-body-border": border,
    "abilityMenu-background": p.panel,
    "abilityMenu-color": text,
    "abilityMenu-border": border,
    "abilityMenu-base-color": text,
    "abilityMenu-base-boxShadow": p.textGlow,
    "abilityMenu-hover-color": p.hoverText ?? text,
    "abilityMenu-hover-boxShadow": p.accentGlow,
    "buttons-base-background": p.button,
    "buttons-base-color": p.buttonText,
    "buttons-base-border": p.button,
    "buttons-hover-background": p.buttonHover,
    "buttons-hover-color": p.buttonText,
    "buttons-hover-border": p.buttonHover,
    "movement-used-background": p.moveUsed,
    "movement-used-boxShadow": "#00000000",
    "movement-baseMovement-background": p.moveBase,
    "movement-baseMovement-boxShadow": p.moveBaseGlow,
    "movement-dashMovement-background": p.moveDash,
    "movement-dashMovement-boxShadow": p.moveDashGlow,
    "movement-dangerMovement-background": p.moveDanger,
    "movement-dangerMovement-boxShadow": p.moveDangerGlow,
  });
  return flat;
}

const RAW = [
  {
    id: "ascandir-gotik",
    name: "Ascandir – Gotik & Pergament",
    // Rahmen, Pergament, Vorhang, Zierpfeil und Stern: vom Nutzer gezeichnete Grafiken (assets/gothic)
    colors: {
      ...palette({
        text: "#efe2c4ff", hoverText: "#fff6e2ff", border: "#b8893eff", hoverBorder: "#f0c870ff",
        portrait: "#0d0b0aff", container: "#0b0908f2",
        panel: "#141110ff", panelHover: "#2a221cff",
        bonus: "#141110ff", bonusHover: "#2a221cff",
        free: "#141110ff", freeHover: "#2a221cff",
        reaction: "#141110ff", reactionHover: "#2a221cff",
        endTurn: "#141110ff", endTurnHover: "#2a221cff",
        ttHeader: "#00000000", ttHeaderText: "#1e140cff",
        ttSubtitle: "#6b1a14ff", ttSubtitleText: "#f2e2c4ff",
        ttBody: "#00000000", ttBodyText: "#24180eff",
        textGlow: "#00000000", accentGlow: "#c9a45a66",
        button: "#3a2a18ff", buttonHover: "#5a4024ff", buttonText: "#f2e2c4ff",
        moveUsed: "#5a524a80", moveBase: "#efe2c2ff", moveBaseGlow: "#00000000",
        moveDash: "#e0b040ff", moveDashGlow: "#00000000", moveDanger: "#a8241cff", moveDangerGlow: "#00000000",
      }),
      "abilityMenu-background": "#e9dcbfff",
      "abilityMenu-color": "#2a1d12ff",
      "abilityMenu-border": "#b8893eff",
      "abilityMenu-base-color": "#2a1d12ff",
      "abilityMenu-base-boxShadow": "#00000000",
      "abilityMenu-hover-color": "#7a1a10ff",
      "abilityMenu-hover-boxShadow": "#00000000",
    },
    extras: {
      accent: "#5fb0ffff", hp: "#f4e6d0ff", pip: "#efe2c2ff", pipGlow: "#00000000", pipUsed: "#5a524aff",
      statText: "#f4e6d0ff", statBackground: "#0d0b0aff", panelText: "#ecd9adff",
      headerBg: "#1a1512ff", highlight: "#6b4a2030", iconTint: "#ecd9b0ff",
      hpBox: "#7c1219ff", accentBox: "#0f2d4cff",
    },
    style: {
      font: "Crimson Text", fontScale: 118, radius: 0, borderWidth: 1,
      hoverGlow: true, glowColor: "#c9a45a88", glowSize: 10, textShadow: false, portraitFrame: false,
      skillIcons: true, ornateMenu: true, squarePips: true, titleStrip: true,
      tooltipTitleLeft: true, joinedStats: true, continuousBar: true, hideName: false,
      abilityMedallions: true, highlightProficient: true, tintIcons: true, statBoxColors: true, tooltipDivider: true,
    },
    textures: {
      panel: "", panelSize: 680,
      menuPanel: `${ASSETS}/gothic/parchment-gpt.webp`,
      tooltip: `${ASSETS}/gothic/parchment-gpt-sheet.webp`,
      frame: `${ASSETS}/gothic/frame-gothic.webp`, frameSlice: 280, frameWidth: 18, frameImageWidth: 116, frameOutset: 31, frameRepeat: "round",
      tooltipFrame: `${ASSETS}/gothic/frame-gothic.webp`, tooltipFrameSlice: 280, tooltipFrameWidth: 13, tooltipFrameImageWidth: 84, tooltipFrameOutset: 22,
      barFrame: `${ASSETS}/gothic/frame-gothic.webp`, barFrameSlice: 280, barFrameWidth: 18, barFrameImageWidth: 116, barFrameOutset: 31,
      buttonFrame: `${ASSETS}/gothic/frame-gothic-small.webp`, buttonFrameSlice: 90, buttonFrameWidth: 10, buttonFrameImageWidth: 34, buttonFrameOutset: 9,
      seal: "",
      headerOrnament: "",
      slotFlourish: `${ASSETS}/gothic/gpt-arrow.webp`,
      tooltipDrape: "",
    },
    ornaments: [
      { src: `${ASSETS}/gothic/gpt-drape.webp`, anchor: "portrait", corner: "top-left", x: 0, y: 0, width: 44, height: 250, layer: "front", animation: "sway" },
      { src: `${ASSETS}/gothic/gpt-drape.webp`, anchor: "portrait", corner: "top-right", x: 0, y: 0, width: 44, height: 250, layer: "front", animation: "sway", flip: true },
      { src: `${ASSETS}/gothic/gpt-drape.webp`, anchor: "abilityMenu", corner: "top-right", x: -26, y: 60, width: 34, height: 230, layer: "back", animation: "sway", flip: true },
      { src: `${ASSETS}/gothic/gpt-drape.webp`, anchor: "actionFirst", corner: "top-left", x: -22, y: 6, width: 36, height: 170, layer: "back", animation: "none" },
      { src: `${ASSETS}/gothic/gpt-drape.webp`, anchor: "actionLast", corner: "top-right", x: -22, y: 6, width: 36, height: 170, layer: "back", animation: "none", flip: true },
      { src: `${ASSETS}/gothic/gpt-star.webp`, anchor: "abilityMenu", corner: "bottom-left", x: 24, y: 22, width: 22, height: 25, layer: "front", animation: "none" },
    ],
    customCss: `/* Rast-Knöpfe: Pergament mit dunkler Schrift */
.extended-combat-hud .movement-hud:has(.button-hud-button) { gap: 10px; background: none !important; border: none !important; border-image: none !important; backdrop-filter: none !important; }
.extended-combat-hud .button-hud-button, .extended-combat-hud .button-hud-button i { color: #2a1d12 !important; text-shadow: none !important; }
/* Zauberleiste: freie Punkte wie im Entwurf */
.extended-combat-hud .feature-spell-slots { background: none !important; border: none !important; border-image: none !important; backdrop-filter: none !important; }
.extended-combat-hud .feature-spell-slots .spell-slot:not(.spell-cantrip) { border: 2px solid #2a1d12 !important; box-shadow: 0 0 0 2px #c9a45a, 0 2px 4px #000000 !important; }
.extended-combat-hud .feature-spell-slots .spell-cantrip { color: #ecd9b0 !important; }
.extended-combat-hud .feature-element .feature-element-title { font-size: 1.1em !important; text-transform: none !important; }
/* Portrait: großer Name mit goldener Unterstreichung */
.extended-combat-hud .portrait-hud .player-details { background: linear-gradient(#000000c0, #00000000) !important; -webkit-mask-image: none !important; mask-image: none !important; padding-left: 2.6rem !important; }
.extended-combat-hud .portrait-hud .player-details .player-name { font-size: 2.3rem !important; font-weight: 700; color: #f4e6d0 !important; }
.extended-combat-hud .portrait-hud .player-details .player-detail { display: inline-block; color: #f0e2c4 !important; border-bottom: 2px solid #c9a45a; padding-bottom: 3px; }
/* Menü: Kopfleisten mit Goldkante, Platz für den Stern */
.extended-combat-hud .ability-menu ul > li.ability-title, .extended-combat-hud .ability-menu ul.ability-toggle li { border-radius: 8px; border-color: #c9a45a !important; }
.extended-combat-hud .ability-menu ul.ability-toggle li { padding-left: 2.8rem !important; }
.extended-combat-hud .ability-menu ul > li:not(.ability-title) { border-top-color: #00000022 !important; box-shadow: none !important; }
.extended-combat-hud .ability-menu ul > li:not(.ability-title) > span:not(:first-child),
.extended-combat-hud .ability-menu ul > li:not(.ability-title) > div > span { border-left: none !important; box-shadow: none !important; }
/* Menü-Spalten: Namen bekommen den Platz, Zahlen schmale feste Spalten */
.extended-combat-hud .ability-menu ul.collapsible-panel > li { grid-template-columns: minmax(0, 1fr) 3.1em 3.1em !important; }
.extended-combat-hud .ability-menu ul.collapsible-panel > li > span:not(:first-child) { text-align: center; }
/* Zierpfeile am ∞ größer */
.extended-combat-hud .feature-spell-slots .spell-cantrip::before, .extended-combat-hud .feature-spell-slots .spell-cantrip::after { width: 150px !important; height: 40px !important; }
/* Werteleiste größer */
.extended-combat-hud .portrait-hud .portrait-stat-block:not(.player-details) { font-size: 1.55rem !important; padding: 0.9rem 0.6rem !important; }
.extended-combat-hud .portrait-hud .portrait-stat-block span[style*="movement-baseMovement-background"] { margin: -0.9rem -0.6rem -0.9rem 0.4em !important; }
/* Tooltip: Abstand zu den Zierecken */
.ech-tooltip .ech-tooltip-header { padding: 1.2rem 1.8rem 0.3rem !important; }
.ech-tooltip .ech-tooltip-body { padding: 0 1.8rem 1.3rem !important; }
.ech-tooltip, .ech-tooltip .ech-tooltip-description { color: #24180e !important; }`,
  },
  {
    id: "ascandir-schmiede",
    name: "Ascandir – Schmiede & Pergament",
    colors: {
      ...palette({
        text: "#f0e2c4ff", hoverText: "#fff6e0ff", border: "#6e4c26ff", hoverBorder: "#e0a050ff",
        portrait: "#0e0a07f2", container: "#0b0805e6",
        panel: "#12253cff", panelHover: "#1d3a5cff",
        bonus: "#241a5aff", bonusHover: "#36287aff",
        free: "#12283cff", freeHover: "#1e3d58ff",
        reaction: "#241a5aff", reactionHover: "#36287aff",
        endTurn: "#1a2a16ff", endTurnHover: "#2a4224ff",
        ttHeader: "#00000000", ttHeaderText: "#1e1208ff",
        ttSubtitle: "#6b1a14ff", ttSubtitleText: "#f2e2c4ff",
        ttBody: "#00000000", ttBodyText: "#2b1a0cff",
        textGlow: "#000000cc", accentGlow: "#e0a05099",
        button: "#6b4a24ff", buttonHover: "#9a6a32ff", buttonText: "#f2e2c4ff",
        moveUsed: "#3a332c80", moveBase: "#8fd0f5ff", moveBaseGlow: "#6ec0ffaa",
        moveDash: "#e0b040ff", moveDashGlow: "#f0c860cc", moveDanger: "#c23a2aff", moveDangerGlow: "#e05a4acc",
      }),
      "abilityMenu-background": "#0e0a07f2",
      "abilityMenu-color": "#e6d5b4ff",
      "abilityMenu-border": "#6e4c26ff",
      "abilityMenu-base-color": "#e6d5b4ff",
      "abilityMenu-hover-color": "#ffe9b8ff",
      "abilityMenu-hover-boxShadow": "#e0a05099",
    },
    extras: {
      accent: "#3fa9ffff", hp: "#3ddc54ff", pip: "#8fd0f5ff", pipGlow: "#6ec0ffaa", pipUsed: "#2a354099",
      statText: "#f0e6d2ff", statBackground: "#0b0806e6", panelText: "#ecd8aeff",
    },
    style: {
      font: "Crimson Text", fontScale: 120, radius: 0, borderWidth: 1,
      hoverGlow: true, glowColor: "#e0a050aa", glowSize: 12, textShadow: true, portraitFrame: false,
      skillIcons: true, ornateMenu: true, squarePips: true, titleStrip: true,
      tooltipTitleLeft: true, joinedStats: true, continuousBar: true, hideName: true,
    },
    textures: {
      panel: `${ASSETS}/forge/wood-dark.webp`, panelSize: 256,
      menuPanel: `${ASSETS}/forge/panel-dark.webp`,
      tooltip: `${ASSETS}/forge/parchment-burnt.webp`,
      frame: `${ASSETS}/forge/frame-heavy.svg`, frameSlice: 56, frameWidth: 30, frameRepeat: "round",
      tooltipFrame: `${ASSETS}/forge/frame-tooltip.svg`, tooltipFrameSlice: 38, tooltipFrameWidth: 20,
      barFrame: `${ASSETS}/forge/frame-heavy.svg`, barFrameSlice: 56, barFrameWidth: 24,
      buttonFrame: `${ASSETS}/forge/frame-spike.svg`, buttonFrameSlice: 24, buttonFrameWidth: 10,
      seal: `${ASSETS}/forge/seal.svg`,
      headerOrnament: `${ASSETS}/forge/star.svg`,
    },
    ornaments: [
      { src: `${ASSETS}/forge/scroll-top.svg`, anchor: "abilityMenu", corner: "top-left", x: 18, y: -30, width: 230, height: 62, layer: "front", animation: "none" },
      { src: `${ASSETS}/forge/chain.svg`, anchor: "abilityMenu", corner: "top-right", x: -14, y: 70, width: 22, height: 250, layer: "back", animation: "sway" },
      { src: `${ASSETS}/forge/lantern.svg`, anchor: "actionFirst", corner: "top-left", x: -4, y: -210, width: 64, height: 128, layer: "front", animation: "flicker" },
      { src: `${ASSETS}/forge/scroll-rope.svg`, anchor: "actionLast", corner: "top-right", x: -72, y: -70, width: 100, height: 290, layer: "front", animation: "none" },
    ],
    customCss: `/* Zauberleiste: Punkte frei schwebend wie im Entwurf, Platz für die Laterne */
.extended-combat-hud .action-hud .features-container { margin-left: 70px !important; }
.extended-combat-hud .feature-spell-slots { background: none !important; border: none !important; border-image: none !important; backdrop-filter: none !important; }
.extended-combat-hud .feature-spell-slots .spell-cantrip { color: #ecd8ae !important; font-size: 2.4rem !important; }
.extended-combat-hud .feature-element .feature-element-title { font-size: 1.15em !important; text-transform: none !important; padding: 0.6rem 0.4rem !important; }
.extended-combat-hud .action-hud > .actions-container > .action-element .action-element-title { font-size: 0.95em !important; }
/* Rast-Knöpfe als zwei getrennte Tafeln */
.extended-combat-hud .movement-hud:has(.button-hud-button) { gap: 8px; background: none !important; border: none !important; border-image: none !important; backdrop-filter: none !important; }
.extended-combat-hud .button-hud-button i { color: #e6cfa2 !important; }`,
  },
  {
    id: "ascandir-drachenblut",
    name: "Ascandir – Drachenblut",
    colors: palette({
      text: "#f2e6d8ff", hoverText: "#ffffffff", border: "#8b1e1eff", hoverBorder: "#d43a2fff",
      portrait: "#1a1214e6", container: "#0d0a0be0",
      panel: "#231a1ce6", panelHover: "#5a1f22e6",
      bonus: "#3b1f33e6", bonusHover: "#6e2a55e6",
      free: "#2a2628e6", freeHover: "#4d4245e6",
      reaction: "#6b1414e6", reactionHover: "#a32020e6",
      endTurn: "#24301fe6", endTurnHover: "#3f5a33e6",
      ttHeader: "#2a1416f2", ttHeaderText: "#f2e6d8ff",
      ttSubtitle: "#8b1e1eff", ttSubtitleText: "#ffffffff",
      ttBody: "#1a1214e6", ttBodyText: "#eadccaff",
      textGlow: "#00000099", accentGlow: "#e0403fcc",
      button: "#8b1e1eff", buttonHover: "#c22b22ff", buttonText: "#ffffffff",
      moveUsed: "#4a3d3f80", moveBase: "#d9a441ff", moveBaseGlow: "#ffc861cc",
      moveDash: "#e06a2cff", moveDashGlow: "#ff8a4ccc", moveDanger: "#c21b1bff", moveDangerGlow: "#ff3b3bcc",
    }),
    extras: {
      accent: "#ff5a4aff", hp: "#7ee08aff", pip: "#f2c48dff", pipGlow: "#ff5a3ccc", pipUsed: "#4a3d3f99",
      statText: "#f2e6d8ff", statBackground: "#14090acc", panelText: "#d9b8a8ff",
    },
    style: { font: "Crimson Text", fontScale: 110, radius: 4, borderWidth: 2, hoverGlow: true, glowColor: "#ff3b2fb3", glowSize: 14, textShadow: true, portraitFrame: true },
  },
  {
    id: "ascandir-pergament",
    name: "Ascandir – Pergament & Tinte",
    // Pergament für Menü, Tooltip & Portrait; Knöpfe und Leisten in dunkler Tinte,
    // weil Argons Symbole weiß sind und auf hellem Grund verschwinden würden.
    colors: {
      ...palette({
        text: "#f3e7cfff", hoverText: "#ffffffff", border: "#6b4a2bff", hoverBorder: "#c89a5aff",
        portrait: "#e8d8b4f2", container: "#2e2116f2",
        panel: "#3a2a1cf2", panelHover: "#5a4028f2",
        bonus: "#3d2a3af2", bonusHover: "#5a3d55f2",
        free: "#2a3540f2", freeHover: "#3f5060f2",
        reaction: "#5a2a1ef2", reactionHover: "#7a3a28f2",
        endTurn: "#2f3a24f2", endTurnHover: "#46553af2",
        ttHeader: "#e8d8b4f8", ttHeaderText: "#2b1d10ff",
        ttSubtitle: "#6b4a2bff", ttSubtitleText: "#f5ead2ff",
        ttBody: "#f0e4c8f8", ttBodyText: "#2b1d10ff",
        textGlow: "#00000000", accentGlow: "#c89a5a66",
        button: "#6b4a2bff", buttonHover: "#8a6238ff", buttonText: "#f5ead2ff",
        moveUsed: "#8a7a6080", moveBase: "#6aa8d8ff", moveBaseGlow: "#8ac0e8aa",
        moveDash: "#d4aa44ff", moveDashGlow: "#e8c060aa", moveDanger: "#c44a3aff", moveDangerGlow: "#e06a5aaa",
      }),
      "abilityMenu-background": "#ecdfc0f5",
      "abilityMenu-color": "#2b1d10ff",
      "abilityMenu-border": "#a8875aff",
      "abilityMenu-base-color": "#2b1d10ff",
      "abilityMenu-base-boxShadow": "#00000000",
      "abilityMenu-hover-color": "#8a2a14ff",
      "abilityMenu-hover-boxShadow": "#00000000",
      "portrait-base-color": "#2b1d10ff",
    },
    extras: {
      accent: "#f0c060ff", hp: "#8fe08aff", pip: "#f0c060ff", pipGlow: "#f0c06066", pipUsed: "#ffffff33",
      statText: "#f3e7cfff", statBackground: "#2b1d10e6", panelText: "#f3e7cfff",
    },
    style: {
      font: "Crimson Text", fontScale: 115, radius: 4, borderWidth: 2, hoverGlow: true, glowColor: "#f0c06099", glowSize: 10,
      textShadow: false, portraitFrame: true, skillIcons: true, ornateMenu: true, squarePips: true, titleStrip: true,
    },
  },
  {
    id: "ascandir-arkane-nacht",
    name: "Ascandir – Arkane Nacht",
    colors: palette({
      text: "#cfd8ffff", hoverText: "#ffffffff", border: "#4b5bd6ff", hoverBorder: "#9a8cffff",
      portrait: "#10142ae6", container: "#050714d9",
      panel: "#141a33e6", panelHover: "#2b3570e6",
      bonus: "#2a1650e6", bonusHover: "#4a2a8ae6",
      free: "#14304ae6", freeHover: "#22507ae6",
      reaction: "#4a1438e6", reactionHover: "#7a2460e6",
      endTurn: "#123a36e6", endTurnHover: "#1e5e57e6",
      ttHeader: "#1c2250f2", ttHeaderText: "#e6ebffff",
      ttSubtitle: "#4b5bd6ff", ttSubtitleText: "#ffffffff",
      ttBody: "#10142ae6", ttBodyText: "#d8deffff",
      textGlow: "#6a7cff66", accentGlow: "#9a8cffcc",
      button: "#4b5bd6ff", buttonHover: "#7a6cffff", buttonText: "#ffffffff",
      moveUsed: "#3a3f6080", moveBase: "#7aa2ffff", moveBaseGlow: "#9ab8ffcc",
      moveDash: "#c08aff", moveDashGlow: "#d6a8ffcc", moveDanger: "#ff5a8aff", moveDangerGlow: "#ff7aa2cc",
    }),
    extras: {
      accent: "#a8b8ffff", hp: "#6af0c8ff", pip: "#b4c4ffff", pipGlow: "#7a5cffcc", pipUsed: "#3a3f6099",
      statText: "#e6ebffff", statBackground: "#080b1ccc", panelText: "#aab4e6ff",
    },
    style: { font: "", fontScale: 100, radius: 10, borderWidth: 1, hoverGlow: true, glowColor: "#7a5cffcc", glowSize: 18, textShadow: true, portraitFrame: true },
  },
  {
    id: "ascandir-waldlaeufer",
    name: "Ascandir – Waldläufer",
    colors: palette({
      text: "#e2ead2ff", hoverText: "#ffffffff", border: "#6f8a4eff", hoverBorder: "#a8c770ff",
      portrait: "#1b2419e6", container: "#0a1008d9",
      panel: "#1d2a1ee6", panelHover: "#34502fe6",
      bonus: "#2d3a1ee6", bonusHover: "#4d6330e6",
      free: "#1f3330e6", freeHover: "#33554fe6",
      reaction: "#4a2a1ae6", reactionHover: "#734228e6",
      endTurn: "#26402ae6", endTurnHover: "#3e6644e6",
      ttHeader: "#2a3a22f2", ttHeaderText: "#eef4e0ff",
      ttSubtitle: "#5a7040ff", ttSubtitleText: "#ffffffff",
      ttBody: "#1b2419e6", ttBodyText: "#e2ead2ff",
      textGlow: "#00000099", accentGlow: "#b6d36bcc",
      button: "#5a7040ff", buttonHover: "#7a9452ff", buttonText: "#ffffffff",
      moveUsed: "#4a523f80", moveBase: "#8fc25aff", moveBaseGlow: "#a8dc70cc",
      moveDash: "#d4b44aff", moveDashGlow: "#ecd06acc", moveDanger: "#c2552aff", moveDangerGlow: "#e0744acc",
    }),
    extras: {
      accent: "#b6d36bff", hp: "#9ff07aff", pip: "#cfe3a4ff", pipGlow: "#9ccc5acc", pipUsed: "#4a523f99",
      statText: "#eef4e0ff", statBackground: "#0d140bcc", panelText: "#bccaa4ff",
    },
    style: { font: "", fontScale: 100, radius: 3, borderWidth: 1, hoverGlow: true, glowColor: "#9ccc5aaa", glowSize: 10, textShadow: true, portraitFrame: false },
  },
  {
    id: "ascandir-eisen-glut",
    name: "Ascandir – Eisen & Glut",
    colors: palette({
      text: "#e8e1d6ff", hoverText: "#ffffffff", border: "#6e6a66ff", hoverBorder: "#ff9a3cff",
      portrait: "#1c1d20e6", container: "#0a0a0bd9",
      panel: "#1e1f22e6", panelHover: "#3a2a20e6",
      bonus: "#3b2b1ce6", bonusHover: "#6a4422e6",
      free: "#263038e6", freeHover: "#3c4c58e6",
      reaction: "#5a2014e6", reactionHover: "#8a3018e6",
      endTurn: "#22301fe6", endTurnHover: "#3a5234e6",
      ttHeader: "#2a2724f2", ttHeaderText: "#f4ece0ff",
      ttSubtitle: "#8a4a1aff", ttSubtitleText: "#ffffffff",
      ttBody: "#1c1d20e6", ttBodyText: "#e8e1d6ff",
      textGlow: "#00000099", accentGlow: "#ff9a3ccc",
      button: "#8a4a1aff", buttonHover: "#c4651fff", buttonText: "#ffffffff",
      moveUsed: "#4a464280", moveBase: "#ffb35cff", moveBaseGlow: "#ffc87acc",
      moveDash: "#e0d05aff", moveDashGlow: "#f0e07acc", moveDanger: "#e0402aff", moveDangerGlow: "#ff604acc",
    }),
    extras: {
      accent: "#ff9a3cff", hp: "#8ee07aff", pip: "#ffb35cff", pipGlow: "#ff6a00cc", pipUsed: "#4a464299",
      statText: "#f4ece0ff", statBackground: "#0e0e10cc", panelText: "#c8bcaaff",
    },
    style: { font: "", fontScale: 100, radius: 2, borderWidth: 2, hoverGlow: true, glowColor: "#ff7a1acc", glowSize: 14, textShadow: true, portraitFrame: true },
  },
];

export const BUILTIN_THEMES = Object.fromEntries(
  RAW.map((t) => {
    const base = defaultTheme();
    const theme = normalizeTheme({
      ...t,
      colors: { ...base.colors, ...t.colors },
      extras: { ...base.extras, ...t.extras },
      style: { ...base.style, ...t.style },
      textures: { ...base.textures, ...t.textures },
      ornaments: t.ornaments ?? [],
    });
    theme.builtin = true;
    return [theme.id, theme];
  })
);
