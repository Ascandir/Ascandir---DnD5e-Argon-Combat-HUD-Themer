/**
 * Erzeugt aus einem Theme CSS und hängt es als <style> in die Seite.
 * Argon setzt seine Farben als Inline-Variablen auf <html>; Werte mit
 * !important in einem Stylesheet haben Vorrang davor, daher bleibt Argons
 * eigener Editor unangetastet und greift wieder, sobald kein Themer-Theme aktiv ist.
 */
import { MODULE_ID } from "./schema.js";

const STYLE_ID = `${MODULE_ID}-active-theme`;
const HUD = ".extended-combat-hud";

/** Entfernt alles, was aus einem <style>-Block ausbrechen könnte. */
function safeCss(text) {
  return String(text ?? "").replace(/<\/?style/gi, "");
}

function fontStack(font) {
  const clean = String(font).replace(/["\\;{}]/g, "").trim();
  return `"${clean}", var(--font-primary, "Signika"), sans-serif`;
}

export function buildThemeCss(theme) {
  if (!theme) return "";
  const { colors, extras, style } = theme;
  const out = [];

  // 1) Argon-Variablen
  const vars = Object.entries(colors).map(([k, v]) => `  --ech-${k}: ${v} !important;`);
  if (style.font) vars.push(`  --ech-font-family: ${fontStack(style.font)} !important;`);
  out.push(`:root {\n${vars.join("\n")}\n}`);

  // 2) Fest verdrahtete Argon-Farben
  out.push(`
${HUD} .portrait-hud .portrait-stat-block [data-ac-value]:after,
${HUD} .portrait-hud .portrait-stat-block [data-spell-dc]:after,
${HUD} .portrait-hud .portrait-stat-block span[style*="movement-baseMovement-background"],
${HUD} .movement-hud .movement-current { color: ${extras.accent} !important; }
${HUD} .portrait-hud .portrait-stat-block span[style*="rgb(0, 255, 170)"] { color: ${extras.hp} !important; }
${HUD} .portrait-hud .portrait-stat-block span[style*="rgb(255, 255, 255)"] { color: ${extras.statText} !important; }
${HUD} .portrait-hud .portrait-stat-block span[style*="rgb(255, 255, 255)"] { color: ${extras.statText} !important; }

${HUD} .actions-container.has-actions:after,
${HUD} .actions-container .action-pip,
${HUD} .feature-spell-slots .spell-slot.spell-available {
  background-color: ${extras.pip} !important;
  box-shadow: 0 0 10px 0 ${extras.pipGlow} !important;
}
${HUD} .actions-container.has-actions.actions-used:after,
${HUD} .actions-container .action-pip.actions-used,
${HUD} .feature-spell-slots .spell-slot.spell-used {
  background-color: ${extras.pipUsed} !important;
  box-shadow: none !important;
}
${HUD} .feature-spell-slots .spell-slot.spell-cantrip { color: ${extras.pip} !important; }

${HUD} .portrait-hud .portrait-stat-block,
${HUD} .portrait-hud .player-button,
${HUD} .weapon-sets .weapon-set { color: ${extras.statText} !important; }
${HUD} .portrait-hud .player-button:hover { color: ${colors["mainAction-hover-color"]} !important; }

${HUD} .portrait-hud .portrait-stat-block:not(.player-details):before,
${HUD} .portrait-hud .player-button:before,
${HUD} .weapon-sets .weapon-set { background-color: ${extras.statBackground} !important; }

${HUD} .actions-container:before,
${HUD} .feature-accordion-title,
${HUD} .movement-hud { color: ${extras.panelText} !important; }`);

  // 3) Schriftgröße
  if (style.fontScale !== 100) {
    const f = (style.fontScale / 100).toFixed(2);
    out.push(`
${HUD} .action-element-title,
${HUD} .feature-element-title,
${HUD} .feature-accordion-title,
${HUD} .portrait-stat-block,
${HUD} .player-button,
${HUD} .movement-hud,
${HUD} .actions-container:before { font-size: calc(1em * ${f}) !important; }
${HUD} .ability-menu ul { font-size: calc(1rem * ${f}) !important; }
${HUD} .portrait-hud .player-details .player-name { font-size: calc(1.15em * ${f}) !important; font-weight: 700; }
.ech-tooltip { font-size: calc(16px * ${f}) !important; }`);
  }

  // 4) Form: Ecken & Rahmen
  const r = `${style.radius}px`;
  out.push(`
${HUD} .action-element,
${HUD} .button-hud-button,
${HUD} .feature-element,
${HUD} .feature-accordion-title,
${HUD} .feature-spell-slots,
${HUD} .actions-container:before,
${HUD} .weapon-sets .weapon-set,
${HUD} .portrait-hud .player-button,
${HUD} .portrait-hud .player-button:before,
${HUD} .portrait-hud .portrait-stat-block:not(.player-details),
${HUD} .portrait-hud .portrait-stat-block:not(.player-details):before,
${HUD} .movement-hud,
${HUD} .ability-menu:before { border-radius: ${r} !important; }
${HUD} .portrait-hud,
${HUD} .portrait-hud .portrait-hud-image { border-radius: ${r} !important; }
.ech-tooltip { border-radius: ${r} !important; }

${HUD} .action-element,
${HUD} .button-hud-button,
${HUD} .weapon-sets .weapon-set,
${HUD} .portrait-hud .player-button,
${HUD} .movement-hud,
${HUD} .actions-container:before { border-width: ${style.borderWidth}px !important; border-style: solid !important; }`);

  if (style.portraitFrame) {
    out.push(`
${HUD} .portrait-hud {
  border: ${Math.max(1, style.borderWidth)}px solid ${colors["portrait-base-border"]} !important;
  box-shadow: 0 0 ${Math.max(6, style.glowSize)}px ${colors["portrait-base-border"]}, inset 0 0 18px #000000aa !important;
}`);
  }

  // 5) Effekte
  if (style.hoverGlow) {
    out.push(`
${HUD} .action-element:hover,
${HUD} .action-element.active,
${HUD} .button-hud-button:hover,
${HUD} .feature-element:hover,
${HUD} .portrait-hud .player-button:hover,
${HUD} .weapon-sets .weapon-set:hover {
  box-shadow: 0 0 ${style.glowSize}px ${style.glowColor}, inset 0 0 ${Math.round(style.glowSize / 2)}px ${style.glowColor} !important;
  transition: box-shadow 0.2s ease-in-out;
}`);
  }
  if (style.textShadow) {
    out.push(`
${HUD} .action-element-title,
${HUD} .feature-element-title,
${HUD} .feature-accordion-title,
${HUD} .portrait-stat-block,
${HUD} .player-button,
${HUD} .weapon-set,
${HUD} .movement-hud,
${HUD} .actions-container:before { text-shadow: 0 0 4px #000000, 0 1px 2px #000000 !important; }`);
  }

  // 6) Texturen & Rahmenbilder
  out.push(buildTextureCss(theme));

  // 7) Layout-Ausgleich für dickere Rahmen
  out.push(buildLayoutFixCss(theme));

  // 8) Zusatz-Funktionen (Icons, Menü, Punkte, Titelstreifen)
  out.push(buildFeatureCss(theme));

  // 9) Eigenes CSS
  if (theme.customCss?.trim()) out.push(`/* Eigenes CSS */\n${safeCss(theme.customCss)}`);

  return `/* ${MODULE_ID}: ${String(theme.name).replace(/\*\//g, "")} */\n${out.join("\n")}`;
}

/** Pfad -> url("..."). Relative Pfade (z. B. modules/…) lösen sich gegen die Foundry-Adresse auf. */
function cssUrl(path) {
  if (!path) return "none";
  let href = String(path);
  try { href = new URL(href, document.baseURI).href; } catch { /* Pfad unverändert */ }
  return `url("${href.replace(/["\\]/g, "")}")`;
}

function borderImage(src, slice, width, repeat = "stretch", imageWidth = 0, outset = 0) {
  const w = `${width}px`;
  const iw = `${imageWidth || width}px`;
  return `border-style: solid !important;
  border-width: ${w} !important;
  border-image: ${cssUrl(src)} ${slice} / ${iw} / ${outset}px ${repeat} !important;
  border-radius: 0 !important;`;
}

function buildTextureCss({ textures: t, style }) {
  const out = [];
  const bar = style.continuousBar;
  if (t.panel) {
    out.push(`
${bar ? `${HUD} .action-hud .actions-container,` : `${HUD} .actions-container:before,`}
${HUD} .movement-hud:not(:has(.button-hud-button)),
${HUD} .feature-accordion-title,
${HUD} .feature-spell-slots,
${HUD} .portrait-hud .player-button:before,
${HUD} .weapon-sets .weapon-set {
  background-image: ${cssUrl(t.panel)} !important;
  background-size: ${t.panelSize}px !important;
  background-repeat: repeat !important;
}`);
  }
  // Dunkles Paneel für Menü, Rast-Knöpfe und Werteleiste (sonst gleiche Textur wie Leisten)
  const menuTex = t.menuPanel || t.panel;
  if (menuTex) {
    out.push(`
${HUD} .ability-menu:before,
${HUD} .button-hud-button,
${HUD} .portrait-hud .portrait-stat-block:not(.player-details):before {
  background-image: ${cssUrl(menuTex)} !important;
  background-size: ${t.panelSize}px !important;
  background-repeat: repeat !important;
}`);
  }
  if (t.tooltip) {
    out.push(`
.ech-tooltip {
  background: ${cssUrl(t.tooltip)} 0 0 / 100% 100% no-repeat padding-box, #24160a !important;
  background-origin: padding-box !important;
}
.ech-tooltip .ech-tooltip-header,
.ech-tooltip .ech-tooltip-body { backdrop-filter: none !important; background-color: transparent !important; border-color: transparent !important; }
.ech-highjack-window .window-header,
.ech-highjack-window .window-content {
  background-image: ${cssUrl(t.tooltip)} !important;
  background-size: 100% 100% !important;
}`);
  }
  if (t.frame) {
    out.push(`
${HUD} .portrait-hud,
${HUD} .ability-menu:before${t.tooltipFrame ? "" : ",\n.ech-tooltip"} {
  ${borderImage(t.frame, t.frameSlice, t.frameWidth, t.frameRepeat, t.frameImageWidth, t.frameOutset)}
}
${HUD} .ability-menu { padding: ${t.frameWidth}px !important; }`);
  }
  if (t.tooltipFrame) {
    out.push(`
.ech-tooltip {
  ${borderImage(t.tooltipFrame, t.tooltipFrameSlice, t.tooltipFrameWidth, t.frameRepeat, t.tooltipFrameImageWidth, t.tooltipFrameOutset)}
}`);
  }
  if (t.buttonFrame) {
    out.push(`
${HUD} .action-element,
${HUD} .button-hud-button,
${HUD} .feature-element,
${bar ? "" : `${HUD} .actions-container:before,`}
${HUD} .movement-hud:not(:has(.button-hud-button)),
${HUD} .weapon-sets .weapon-set,
${HUD} .portrait-hud .player-button${style.joinedStats ? "" : `,\n${HUD} .portrait-hud .portrait-stat-block:not(.player-details)`} {
  ${borderImage(t.buttonFrame, t.buttonFrameSlice, t.buttonFrameWidth, t.frameRepeat, t.buttonFrameImageWidth, t.buttonFrameOutset)}
}`);
  }
  if (bar && t.barFrame) {
    out.push(`
${HUD} .action-hud .actions-container {
  ${borderImage(t.barFrame, t.barFrameSlice, t.barFrameWidth, t.frameRepeat, t.barFrameImageWidth, t.barFrameOutset)}
}`);
  }
  if (t.seal) {
    out.push(`
.ech-tooltip-container::after {
  content: "";
  position: absolute;
  top: -22px;
  right: -18px;
  width: 58px;
  height: 84px;
  background: ${cssUrl(t.seal)} center top / contain no-repeat;
  pointer-events: none;
  z-index: 10001;
  filter: drop-shadow(0 2px 3px #000000aa);
}`);
  }
  return out.join("\n");
}

/**
 * Dickere Rahmen verkleinern die Innenfläche. Was Argon von dort aus nach außen
 * positioniert (Initiative-/Bogen-/Minimieren-Knöpfe) oder was mit fester Größe
 * gebaut ist (Quickslots), wird hier um die Mehrbreite zurückgeschoben.
 */
function buildLayoutFixCss({ textures: t, style }) {
  const out = [];
  const portraitBorder = t.frame ? t.frameWidth : style.portraitFrame ? Math.max(1, style.borderWidth) : 1;
  const extraP = portraitBorder - 1;
  if (extraP > 0) {
    out.push(`
${HUD} .portrait-hud .player-buttons {
  right: calc(-115px - ${extraP}px) !important;
  top: calc(-50px - 1rem - 37px - ${extraP}px) !important;
}
${HUD} .portrait-hud .portrait-actor-configuration { top: ${extraP}px !important; right: ${extraP}px !important; }`);
  }
  const setBorder = t.buttonFrame ? t.buttonFrameWidth : style.borderWidth;
  const extraS = Math.max(0, setBorder - 1) * 2;
  if (extraS > 0) {
    out.push(`
${HUD} .weapon-sets .weapon-set > .set {
  height: calc(50px - ${extraS}px) !important;
  min-width: calc(50px - ${extraS}px) !important;
}`);
  }
  return out.join("\n");
}

function buildFeatureCss({ style: s, textures: t, extras: x, colors: c }) {
  const out = [];
  if (s.titleStrip) {
    out.push(`
${HUD} .action-element .action-element-title {
  height: auto !important;
  min-height: 3rem;
  padding: 0.5rem 0.35rem 0.45rem !important;
  line-height: 1.1;
}
${HUD} .action-element-container .action-element .action-element-title {
  min-height: 2rem;
  font-size: 0.8em !important;
  text-transform: uppercase !important;
  padding: 0.3rem 0.2rem !important;
}`);
    out.push(`
${HUD} .action-element .action-element-title,
${HUD} .feature-element .feature-element-title {
  background: linear-gradient(to bottom, transparent 0%, #000000b3 45%, #000000e6 100%) !important;
  backdrop-filter: none !important;
  border-top: none !important;
  color: ${c["mainAction-base-color"]} !important;
}`);
  }
  if (s.squarePips) {
    out.push(`
${HUD} .feature-spell-slots .spell-slot:not(.spell-cantrip) { border-radius: 3px !important; }
${HUD} .actions-container .action-pip { border-radius: 2px !important; }`);
  }
  if (s.ornateMenu) {
    out.push(`
${HUD} .ability-menu ul > li { border-top: 1px solid #00000099 !important; box-shadow: inset 0 1px 0 #ffffff0d; }
${HUD} .ability-menu ul > li.ability-title,
${HUD} .ability-menu ul.ability-toggle li {
  position: relative;
  background: linear-gradient(to bottom, color-mix(in srgb, ${x.headerBg} 75%, #ffffff 25%) 0%, ${x.headerBg} 55%, color-mix(in srgb, ${x.headerBg} 55%, #000000) 100%) !important;
  letter-spacing: 0.05em;
  color: ${x.panelText} !important;
  border: 1px solid ${c["abilityMenu-border"]} !important;
  box-shadow: inset 0 1px 0 #ffffff1f, inset 0 -2px 4px #000000aa, 0 2px 3px #000000aa !important;
  margin: 2px 0;
}
${HUD} .ability-menu ul > li:not(.ability-title) { color: ${c["abilityMenu-base-color"]}; }
${HUD} .ability-menu ul > li:not(.ability-title) > span:first-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
${HUD} .ability-menu ul > li:not(.ability-title) > span:not(:first-child),
${HUD} .ability-menu ul > li:not(.ability-title) > div > span {
  border-left: 1px solid #00000099;
  box-shadow: -1px 0 0 #ffffff0f;
}
${HUD} .ability-menu ul > li i.fa-check,
${HUD} .ability-menu ul > li i.fa-check-double,
${HUD} .ability-menu ul > li i.fa-adjust { color: inherit !important; }`);
    if (t.headerOrnament) {
      out.push(`
${HUD} .ability-menu ul.collapsible-panel > li.ability-title > span:only-child::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4.2em;
  height: 2.2em;
  transform: translate(-50%, -50%);
  background: ${cssUrl(t.headerOrnament)} center / contain no-repeat;
  pointer-events: none;
}`);
    }
  }
  if (s.skillIcons) {
    out.push(`
${HUD} .ability-menu .asc-skill-icon {
  display: inline-block;
  width: 1.5em;
  margin-right: 0.5ch;
  text-align: center;
  color: inherit;
  opacity: 0.85;
  pointer-events: none;
}
.ech-tooltip .ech-tooltip-header .asc-skill-icon {
  margin-right: 0.5ch;
  color: ${c["tooltip-header-color"]};
}`);
  }
  if (s.abilityMedallions) {
    out.push(`
${HUD} .ability-menu .asc-ability-icon {
  width: 1.9em; height: 1.9em; line-height: calc(1.9em - 4px);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #3e3732, #0c0a09 72%);
  border: 2px solid ${c["abilityMenu-border"]};
  box-shadow: 0 0 0 1px #000000, inset 0 0 4px #000000;
  color: ${x.iconTint} !important;
  opacity: 1 !important;
  font-size: 0.9em;
  margin-right: 0.8ch !important;
  vertical-align: middle;
}`);
  }
  if (s.highlightProficient) {
    out.push(`
${HUD} .ability-menu ul > li.asc-proficient {
  background: ${x.highlight} !important;
  border: 1px solid ${c["abilityMenu-border"]} !important;
  border-radius: 999px;
  box-shadow: inset 0 0 8px #00000033 !important;
  font-weight: 700;
}
${HUD} .ability-menu ul > li.asc-proficient > span:first-child > i.fa-check,
${HUD} .ability-menu ul > li.asc-proficient > span:first-child > i.fa-check-double {
  width: 1.35em; height: 1.35em; line-height: calc(1.35em - 4px);
  text-align: center; border-radius: 50%;
  background: #17110b; color: ${x.iconTint} !important;
  border: 2px solid ${c["abilityMenu-border"]};
  font-size: 0.85em;
}`);
  }
  if (s.tintIcons) {
    out.push(`
${HUD} .action-element:not(.item-button)::after {
  content: "";
  position: absolute;
  inset: 0;
  background: ${x.iconTint};
  mix-blend-mode: multiply;
  pointer-events: none;
}`);
  }
  if (s.statBoxColors) {
    out.push(`
${HUD} .portrait-hud .portrait-stat-block:not(.player-details):before {
  background-image: none !important;
  background-color: ${x.statBackground} !important;
}
${HUD} .portrait-hud .portrait-stat-block:not(.player-details):nth-child(1 of .portrait-stat-block:not(.player-details)):before {
  background: linear-gradient(to bottom, color-mix(in srgb, ${x.hpBox} 80%, #ffffff 20%), ${x.hpBox} 60%, color-mix(in srgb, ${x.hpBox} 60%, #000000)) !important;
}
${HUD} .portrait-hud .portrait-stat-block span[style*="movement-baseMovement-background"] {
  align-self: stretch;
  display: flex; align-items: center;
  margin: -0.75rem -0.75rem -0.75rem 0.35em;
  padding: 0 0.55em;
  background: linear-gradient(to bottom, color-mix(in srgb, ${x.accentBox} 80%, #ffffff 20%), ${x.accentBox} 60%);
  border-left: 1px solid ${c["mainAction-base-border"]};
}`);
  }
  if (s.tooltipDivider) {
    out.push(`
.ech-tooltip .ech-tooltip-header::after {
  content: "";
  display: block;
  height: 1px;
  margin-top: 0.45em;
  background: linear-gradient(90deg, transparent, ${c["tooltip-header-color"]}99 8%, ${c["tooltip-header-color"]}99 92%, transparent);
}`);
  }
  if (t.slotFlourish) {
    out.push(`
${HUD} .feature-spell-slots .spell-cantrip::before,
${HUD} .feature-spell-slots .spell-cantrip::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 110px;
  height: 28px;
  background: ${cssUrl(t.slotFlourish)} center / contain no-repeat;
  pointer-events: none;
}
${HUD} .feature-spell-slots .spell-cantrip::before { right: calc(100% + 6px); transform: translateY(-50%) scaleX(-1); }
${HUD} .feature-spell-slots .spell-cantrip::after { left: calc(100% + 6px); transform: translateY(-50%); }`);
  }
  if (t.tooltipDrape) {
    out.push(`
.ech-tooltip-container::before {
  content: "";
  position: absolute;
  left: 14%;
  bottom: -46px;
  width: 64px;
  height: 120px;
  background: ${cssUrl(t.tooltipDrape)} center bottom / contain no-repeat;
  pointer-events: none;
  z-index: -1;
}`);
  }
  if (s.tooltipTitleLeft) {
    out.push(`
.ech-tooltip .ech-tooltip-header { text-align: left !important; padding: 0.7rem 1rem 0.3rem !important; }
.ech-tooltip.hide-subtitle .ech-tooltip-header { padding: 0.7rem 1rem 0.3rem !important; }
.ech-tooltip .ech-tooltip-header h2 {
  display: flex; align-items: center; gap: 0.55em;
  margin: 0 !important; border: none !important;
  font-weight: 700; font-size: 1.45em; line-height: 1.15;
}
.ech-tooltip .ech-tooltip-header .asc-skill-icon { font-size: 0.95em; margin-right: 0 !important; }
.ech-tooltip .ech-tooltip-body .ech-tooltip-description { padding-top: 0.2rem; line-height: 1.3; }`);
  }
  if (s.hideName) {
    out.push(`
${HUD} .portrait-hud .player-details .player-name,
${HUD} .portrait-hud .player-details .player-detail { display: none !important; }
${HUD} .portrait-hud .portrait-stat-block.player-details { background: none !important; -webkit-mask-image: none !important; mask-image: none !important; }`);
  }
  if (s.joinedStats) {
    out.push(`
${HUD} .portrait-hud { justify-content: stretch !important; padding: 0 10px 10px !important; }
${HUD} .portrait-hud .portrait-stat-block:not(.player-details) {
  flex: 1 1 0;
  margin: 0 !important;
  border: 1px solid ${c["mainAction-base-border"]} !important;
  border-left-width: 0 !important;
  border-image: none !important;
  border-radius: 0 !important;
  box-shadow: inset 0 0 6px #000000cc;
}
${HUD} .portrait-hud .portrait-stat-block:not(.player-details):nth-child(1 of .portrait-stat-block:not(.player-details)) { border-left-width: 1px !important; }`);
  }
  if (s.continuousBar) {
    // Aktionsleisten werden zu einer durchgehenden Planke; die Beschriftung liegt innen.
    const fw = t.barFrame ? t.barFrameWidth : 0;
    const padTop = 10, labelH = 46, gap = 8;
    const padBottom = labelH + gap * 2;
    const growth = padTop + padBottom + fw * 2 - 55;
    out.push(`
${HUD} .action-hud .actions-container {
  margin-bottom: 0 !important;
  padding: ${padTop}px 8px ${padBottom}px !important;
  gap: 6px;
}
${HUD} .action-hud .actions-container:before {
  left: 8px !important;
  width: calc(100% - 16px) !important;
  bottom: ${gap}px !important;
  height: ${labelH}px !important;
  background: linear-gradient(to bottom, #00000099, #000000cc) !important;
  border: 1px solid #00000099 !important;
  border-image: none !important;
  box-shadow: inset 0 2px 6px #000000, 0 1px 0 #ffffff14 !important;
  color: ${x.panelText} !important;
  letter-spacing: 0.04em;
}
${HUD} .action-hud .actions-container .actions-uses-container { bottom: ${padBottom - 6}px !important; }
${HUD} .action-hud .features-container { bottom: calc(270px + ${growth}px) !important; }`);
  }
  return out.join("\n");
}

function styleElement(create = true) {
  let el = document.getElementById(STYLE_ID);
  if (!el && create) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    // ans Ende von <head>, damit es nach Argons Stylesheet geladen wird
    document.head.appendChild(el);
  }
  return el;
}

/** Wendet ein Theme an (oder entfernt das Themer-CSS bei null). */
export function applyTheme(theme) {
  if (!theme) {
    styleElement(false)?.remove();
    return;
  }
  const el = styleElement(true);
  el.textContent = buildThemeCss(theme);
  if (el !== document.head.lastElementChild) document.head.appendChild(el);
}

/** Schaltet das Themer-CSS kurz ab (z. B. um Argons eigene Werte auszulesen). */
export function withThemeDisabled(fn) {
  const el = styleElement(false);
  if (el) el.disabled = true;
  try {
    return fn();
  } finally {
    if (el) el.disabled = false;
  }
}
