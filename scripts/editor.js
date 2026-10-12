/**
 * Theme-Editor (nur SL): Bibliothek links, Einstellungen rechts, Live-Vorschau.
 */
import {
  MODULE_ID, ARGON_COLOR_GROUPS, EXTRA_COLOR_FIELDS, defaultTheme, normalizeTheme,
  ORNAMENT_ANCHORS, ORNAMENT_CORNERS, ORNAMENT_ANIMATIONS, MAX_ORNAMENTS, defaultOrnament,
  splitHex8, joinHex8, toHex8,
} from "./schema.js";
import {
  NONE, getAllThemes, getTheme, isBuiltin, saveTheme, deleteTheme,
  getWorldThemeId, setWorldTheme, setPreview, clearPreview,
} from "./store.js";
import { withThemeDisabled } from "./apply.js";

const { ApplicationV2, DialogV2 } = foundry.applications.api;

const L = (key, data) =>
  data ? game.i18n.format(`${MODULE_ID}.${key}`, data) : game.i18n.localize(`${MODULE_ID}.${key}`);

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function getFontChoices() {
  let fonts = [];
  try {
    const FontConfig = foundry.applications.settings?.menus?.FontConfig;
    const choices = FontConfig?.getAvailableFontChoices?.();
    if (choices) fonts = Object.keys(choices);
  } catch { /* ignorieren */ }
  if (!fonts.length) fonts = Object.keys(CONFIG.fontDefinitions ?? {});
  fonts.push("Crimson Text"); // mitgelieferte Schrift
  return [...new Set(fonts)].sort((a, b) => a.localeCompare(b));
}

/** Beschriftung für eine Argon-Farbvariable, z. B. "bonusAction-hover-border" -> "Hover · Rahmen". */
function colorLabel(key) {
  if (key === "mainAction-background-color") return L("labels.barBackground");
  const parts = key.split("-");
  const prop = L(`labels.prop.${parts.at(-1)}`);
  if (parts.length === 2) return prop;
  return `${L(`labels.state.${parts[1]}`)} · ${prop}`;
}

export class ThemeEditor extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-editor`,
    classes: ["ascandir-themer"],
    tag: "div",
    window: {
      title: `${MODULE_ID}.editor.title`,
      icon: "fas fa-palette",
      resizable: true,
    },
    position: { width: 940, height: 780 },
    actions: {
      selectTheme: ThemeEditor.#onSelect,
      newTheme: ThemeEditor.#onNew,
      fromArgon: ThemeEditor.#onFromArgon,
      duplicateTheme: ThemeEditor.#onDuplicate,
      deleteTheme: ThemeEditor.#onDelete,
      importTheme: ThemeEditor.#onImport,
      exportTheme: ThemeEditor.#onExport,
      saveTheme: ThemeEditor.#onSave,
      revertTheme: ThemeEditor.#onRevert,
      activateTheme: ThemeEditor.#onActivate,
      browseFile: ThemeEditor.#onBrowse,
      addOrnament: ThemeEditor.#onAddOrnament,
      removeOrnament: ThemeEditor.#onRemoveOrnament,
    },
  };

  /** ID des gewählten Themes (null = neues, noch nicht gespeichertes Theme). */
  selectedId = null;
  /** Arbeitskopie, die im Editor verändert wird. */
  working = null;
  dirty = false;

  constructor(options = {}) {
    super(options);
    const start = getWorldThemeId();
    const all = getAllThemes();
    this.selectedId = all[start] ? start : Object.keys(all)[0] ?? null;
    this.working = foundry.utils.deepClone(this.selectedId ? all[this.selectedId] : this.#blank());
  }

  #blank(name) {
    const t = defaultTheme();
    t.name = name ?? L("editor.newName");
    return t;
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  async _renderHTML() {
    return `${this.#renderLibrary()}<section class="act-main">${this.#renderEditor()}</section>`;
  }

  _replaceHTML(result, content) {
    // Scrollposition und offene Abschnitte über das Neu-Zeichnen hinweg behalten
    const scroll = content.querySelector(".act-scroll")?.scrollTop ?? 0;
    const open = [...content.querySelectorAll(".act-scroll > details")].map((d) => d.open);
    content.innerHTML = result;
    const details = content.querySelectorAll(".act-scroll > details");
    if (open.length === details.length) details.forEach((d, i) => (d.open = open[i]));
    const sc = content.querySelector(".act-scroll");
    if (sc) sc.scrollTop = scroll;
  }

  _onFirstRender(context, options) {
    super._onFirstRender?.(context, options);
    this.element.addEventListener("input", (ev) => this.#onInput(ev));
    this.element.addEventListener("change", (ev) => this.#onInput(ev, true));
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    this.#updatePreviewBox();
    setPreview(this.working);
  }

  _onClose(options) {
    super._onClose?.(options);
    clearPreview();
  }

  #renderLibrary() {
    const all = Object.values(getAllThemes());
    const worldId = getWorldThemeId();
    const item = (t) => `
      <li class="act-lib-item ${t.id === this.selectedId ? "active" : ""}" data-action="selectTheme" data-id="${esc(t.id)}">
        <span class="act-lib-swatches">
          <i style="background:${t.colors["mainAction-base-background"]}"></i>
          <i style="background:${t.colors["bonusAction-base-background"]}"></i>
          <i style="background:${t.colors["reaction-base-background"]}"></i>
          <i style="background:${t.colors["portrait-base-border"]}"></i>
        </span>
        <span class="act-lib-name">${esc(t.name)}</span>
        ${t.id === worldId ? `<i class="fas fa-globe act-lib-flag" data-tooltip="${esc(L("editor.isWorldTheme"))}"></i>` : ""}
        ${t.builtin ? `<i class="fas fa-lock act-lib-flag" data-tooltip="${esc(L("editor.builtinHint"))}"></i>` : ""}
      </li>`;
    const builtins = all.filter((t) => t.builtin);
    const customs = all.filter((t) => !t.builtin).sort((a, b) => a.name.localeCompare(b.name));
    const unsaved = this.selectedId === null
      ? `<li class="act-lib-item active"><span class="act-lib-name"><i class="fas fa-pen"></i> ${esc(this.working.name)}</span></li>`
      : "";
    return `
      <aside class="act-library">
        <h3>${L("editor.library")}</h3>
        <div class="act-lib-buttons">
          <button type="button" data-action="newTheme"><i class="fas fa-plus"></i> ${L("editor.new")}</button>
          <button type="button" data-action="fromArgon" data-tooltip="${esc(L("editor.fromArgonHint"))}"><i class="fas fa-eye-dropper"></i> ${L("editor.fromArgon")}</button>
          <button type="button" data-action="importTheme"><i class="fas fa-file-import"></i> ${L("editor.import")}</button>
        </div>
        <h4>${L("editor.myThemes")}</h4>
        <ul class="act-lib-list">${unsaved}${customs.map(item).join("") || (unsaved ? "" : `<li class="act-lib-empty">${L("editor.noCustom")}</li>`)}</ul>
        <h4>${L("editor.builtinThemes")}</h4>
        <ul class="act-lib-list">${builtins.map(item).join("")}</ul>
        <p class="act-lib-world">${L("editor.worldThemeIs")}: <b>${esc(getTheme(worldId)?.name ?? L("choices.none"))}</b>
          ${worldId !== NONE ? `<a data-action="activateTheme" data-id="${NONE}">${L("editor.resetToArgon")}</a>` : ""}</p>
      </aside>`;
  }

  #colorRow(path, label, value) {
    const { rgb, alpha } = splitHex8(value);
    return `
      <div class="act-color" data-path="${esc(path)}">
        <label>${esc(label)}</label>
        <span class="act-swatch"><span style="background:${value}"></span></span>
        <input type="color" class="act-rgb" value="${rgb}">
        <input type="range" class="act-alpha" min="0" max="100" step="1" value="${alpha}" data-tooltip="${esc(L("editor.opacity"))}">
        <span class="act-alpha-val">${alpha}%</span>
        <input type="text" class="act-hex" value="${value}" maxlength="9" spellcheck="false">
      </div>`;
  }

  #hasTextures() {
    const t = this.working.textures;
    return !!(t.panel || t.menuPanel || t.tooltip || t.frame || t.tooltipFrame || t.barFrame || t.buttonFrame || t.seal);
  }

  #ornamentRow(o, i) {
    const p = `ornaments.${i}`;
    const opt = (list, value, prefix) => list.map((v) =>
      `<option value="${v}" ${v === value ? "selected" : ""}>${esc(L(`${prefix}.${v}`))}</option>`).join("");
    const num = (key, label) =>
      `<label>${esc(label)}<input type="number" data-path="${p}.${key}" value="${o[key]}" step="1"></label>`;
    let thumb = "";
    if (o.src) {
      let href = o.src;
      try { href = new URL(o.src, document.baseURI).href; } catch { /* unverändert */ }
      thumb = `background-image:url('${esc(href)}')`;
    }
    return `
      <div class="act-orn">
        <div class="act-orn-src">
          <span class="act-orn-thumb" style="${thumb}"></span>
          <input type="text" data-path="${p}.src" value="${esc(o.src)}" placeholder="${esc(L("editor.texNone"))}" spellcheck="false">
          <button type="button" data-action="browseFile" data-target="${p}.src" data-tooltip="${esc(L("editor.texBrowse"))}"><i class="fas fa-file-image"></i></button>
          <button type="button" data-action="removeOrnament" data-index="${i}" data-tooltip="${esc(L("editor.delete"))}"><i class="fas fa-trash"></i></button>
        </div>
        <label>${L("editor.ornAnchor")}<select data-path="${p}.anchor">${opt(ORNAMENT_ANCHORS, o.anchor, "anchor")}</select></label>
        <label>${L("editor.ornCorner")}<select data-path="${p}.corner">${opt(ORNAMENT_CORNERS, o.corner, "corner")}</select></label>
        <label>${L("editor.ornAnimation")}<select data-path="${p}.animation">${opt(ORNAMENT_ANIMATIONS, o.animation, "animation")}</select></label>
        ${num("x", L("editor.ornX"))}
        ${num("y", L("editor.ornY"))}
        <label>${L("editor.ornLayer")}<select data-path="${p}.layer">${opt(["front", "back"], o.layer, "layer")}</select></label>
        ${num("width", L("editor.ornWidth"))}
        ${num("height", L("editor.ornHeight"))}
        <label class="act-orn-flip"><input type="checkbox" data-path="${p}.flip" ${o.flip ? "checked" : ""}> ${L("editor.ornFlip")}</label>
      </div>`;
  }

  #pathRow(path, label, value) {
    return `
      <div class="act-field">
        <label>${esc(label)}</label>
        <div class="act-path">
          <input type="text" data-path="${path}" value="${esc(value)}" placeholder="${esc(L("editor.texNone"))}" spellcheck="false">
          <button type="button" data-action="browseFile" data-target="${path}" data-tooltip="${esc(L("editor.texBrowse"))}"><i class="fas fa-file-image"></i></button>
        </div>
      </div>`;
  }

  #renderEditor() {
    const t = this.working;
    const s = t.style;
    const tx = t.textures;
    const builtin = this.selectedId && isBuiltin(this.selectedId);
    const fonts = getFontChoices();
    const fontOptions = [`<option value="">${L("editor.fontArgon")}</option>`]
      .concat(fonts.map((f) => `<option value="${esc(f)}" ${f === s.font ? "selected" : ""}>${esc(f)}</option>`));
    if (s.font && !fonts.includes(s.font)) fontOptions.push(`<option value="${esc(s.font)}" selected>${esc(s.font)}</option>`);

    const range = (path, value, min, max, step, unit) => `
      <div class="act-range">
        <input type="range" data-path="${path}" min="${min}" max="${max}" step="${step}" value="${value}">
        <span class="act-range-val" data-unit="${unit}">${value}${unit}</span>
      </div>`;
    const check = (path, value) => `<input type="checkbox" data-path="${path}" ${value ? "checked" : ""}>`;

    const extras = EXTRA_COLOR_FIELDS.map(([k]) => this.#colorRow(`extras.${k}`, L(`labels.extra.${k}`), t.extras[k])).join("");
    const groups = ARGON_COLOR_GROUPS.map((g) => `
      <details class="act-group">
        <summary>${L(`labels.group.${g.id}`)}
          <span class="act-mini">${g.fields.slice(0, 4).map(([k]) => `<i style="background:${t.colors[k]}"></i>`).join("")}</span>
        </summary>
        ${g.fields.map(([k]) => this.#colorRow(`colors.${k}`, colorLabel(k), t.colors[k])).join("")}
      </details>`).join("");

    return `
      <header class="act-head">
        <input type="text" class="act-name" data-path="name" value="${esc(t.name)}" placeholder="${esc(L("editor.namePlaceholder"))}">
        ${this.dirty ? `<span class="act-dirty" data-tooltip="${esc(L("editor.unsaved"))}"><i class="fas fa-circle"></i></span>` : ""}
      </header>
      ${builtin ? `<p class="act-notice"><i class="fas fa-lock"></i> ${L("editor.builtinNotice")}</p>` : ""}
      <div class="act-scroll">
        ${this.#renderPreviewBox()}

        <details class="act-group" open>
          <summary>${L("editor.sectionStyle")}</summary>
          <div class="act-field"><label>${L("editor.font")}</label><select data-path="style.font">${fontOptions.join("")}</select></div>
          <div class="act-field"><label>${L("editor.fontScale")}</label>${range("style.fontScale", s.fontScale, 70, 150, 5, "%")}</div>
          <div class="act-field"><label>${L("editor.radius")}</label>${range("style.radius", s.radius, 0, 40, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.borderWidth")}</label>${range("style.borderWidth", s.borderWidth, 0, 8, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.portraitFrame")}</label>${check("style.portraitFrame", s.portraitFrame)}</div>
          <div class="act-field"><label>${L("editor.skillIcons")}</label>${check("style.skillIcons", s.skillIcons)}</div>
          <div class="act-field"><label>${L("editor.ornateMenu")}</label>${check("style.ornateMenu", s.ornateMenu)}</div>
          <div class="act-field"><label>${L("editor.titleStrip")}</label>${check("style.titleStrip", s.titleStrip)}</div>
          <div class="act-field"><label>${L("editor.squarePips")}</label>${check("style.squarePips", s.squarePips)}</div>
          <div class="act-field"><label>${L("editor.textShadow")}</label>${check("style.textShadow", s.textShadow)}</div>
          <div class="act-field"><label>${L("editor.hoverGlow")}</label>${check("style.hoverGlow", s.hoverGlow)}</div>
          <div class="act-field"><label>${L("editor.tooltipTitleLeft")}</label>${check("style.tooltipTitleLeft", s.tooltipTitleLeft)}</div>
          <div class="act-field"><label>${L("editor.joinedStats")}</label>${check("style.joinedStats", s.joinedStats)}</div>
          <div class="act-field"><label>${L("editor.continuousBar")}</label>${check("style.continuousBar", s.continuousBar)}</div>
          <div class="act-field"><label>${L("editor.hideName")}</label>${check("style.hideName", s.hideName)}</div>
          <div class="act-field"><label>${L("editor.abilityMedallions")}</label>${check("style.abilityMedallions", s.abilityMedallions)}</div>
          <div class="act-field"><label>${L("editor.highlightProficient")}</label>${check("style.highlightProficient", s.highlightProficient)}</div>
          <div class="act-field"><label>${L("editor.tintIcons")}</label>${check("style.tintIcons", s.tintIcons)}</div>
          <div class="act-field"><label>${L("editor.statBoxColors")}</label>${check("style.statBoxColors", s.statBoxColors)}</div>
          <div class="act-field"><label>${L("editor.tooltipDivider")}</label>${check("style.tooltipDivider", s.tooltipDivider)}</div>
          <div class="act-field"><label>${L("editor.glowSize")}</label>${range("style.glowSize", s.glowSize, 0, 40, 1, "px")}</div>
          ${this.#colorRow("style.glowColor", L("editor.glowColor"), s.glowColor)}
        </details>

        <details class="act-group" open>
          <summary>${L("editor.sectionExtras")}</summary>
          <p class="hint">${L("editor.extrasHint")}</p>
          ${extras}
        </details>

        <details class="act-group" ${this.#hasTextures() ? "open" : ""}>
          <summary>${L("editor.sectionTextures")}</summary>
          <p class="hint">${L("editor.texturesHint")}</p>
          ${this.#pathRow("textures.panel", L("editor.texPanel"), tx.panel)}
          <div class="act-field"><label>${L("editor.texPanelSize")}</label>${range("textures.panelSize", tx.panelSize, 32, 512, 16, "px")}</div>
          ${this.#pathRow("textures.menuPanel", L("editor.texMenuPanel"), tx.menuPanel)}
          ${this.#pathRow("textures.tooltip", L("editor.texTooltip"), tx.tooltip)}
          ${this.#pathRow("textures.frame", L("editor.texFrame"), tx.frame)}
          <div class="act-field"><label>${L("editor.texSlice")}</label>${range("textures.frameSlice", tx.frameSlice, 1, 200, 1, "")}</div>
          <div class="act-field"><label>${L("editor.texWidth")}</label>${range("textures.frameWidth", tx.frameWidth, 1, 48, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texImageWidth")}</label>${range("textures.frameImageWidth", tx.frameImageWidth, 0, 200, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texOutset")}</label>${range("textures.frameOutset", tx.frameOutset, 0, 80, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texRepeat")}</label><select data-path="textures.frameRepeat">
            <option value="stretch" ${tx.frameRepeat === "stretch" ? "selected" : ""}>${L("editor.texRepeatStretch")}</option>
            <option value="round" ${tx.frameRepeat === "round" ? "selected" : ""}>${L("editor.texRepeatRound")}</option>
          </select></div>
          ${this.#pathRow("textures.tooltipFrame", L("editor.texTooltipFrame"), tx.tooltipFrame)}
          <div class="act-field"><label>${L("editor.texSlice")}</label>${range("textures.tooltipFrameSlice", tx.tooltipFrameSlice, 1, 200, 1, "")}</div>
          <div class="act-field"><label>${L("editor.texWidth")}</label>${range("textures.tooltipFrameWidth", tx.tooltipFrameWidth, 1, 48, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texImageWidth")}</label>${range("textures.tooltipFrameImageWidth", tx.tooltipFrameImageWidth, 0, 200, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texOutset")}</label>${range("textures.tooltipFrameOutset", tx.tooltipFrameOutset, 0, 80, 1, "px")}</div>
          ${this.#pathRow("textures.barFrame", L("editor.texBarFrame"), tx.barFrame)}
          <div class="act-field"><label>${L("editor.texSlice")}</label>${range("textures.barFrameSlice", tx.barFrameSlice, 1, 200, 1, "")}</div>
          <div class="act-field"><label>${L("editor.texWidth")}</label>${range("textures.barFrameWidth", tx.barFrameWidth, 1, 48, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texImageWidth")}</label>${range("textures.barFrameImageWidth", tx.barFrameImageWidth, 0, 200, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texOutset")}</label>${range("textures.barFrameOutset", tx.barFrameOutset, 0, 80, 1, "px")}</div>
          ${this.#pathRow("textures.buttonFrame", L("editor.texButtonFrame"), tx.buttonFrame)}
          <div class="act-field"><label>${L("editor.texSlice")}</label>${range("textures.buttonFrameSlice", tx.buttonFrameSlice, 1, 200, 1, "")}</div>
          <div class="act-field"><label>${L("editor.texWidth")}</label>${range("textures.buttonFrameWidth", tx.buttonFrameWidth, 1, 24, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texImageWidth")}</label>${range("textures.buttonFrameImageWidth", tx.buttonFrameImageWidth, 0, 200, 1, "px")}</div>
          <div class="act-field"><label>${L("editor.texOutset")}</label>${range("textures.buttonFrameOutset", tx.buttonFrameOutset, 0, 80, 1, "px")}</div>
          ${this.#pathRow("textures.seal", L("editor.texSeal"), tx.seal)}
          ${this.#pathRow("textures.headerOrnament", L("editor.texHeaderOrnament"), tx.headerOrnament)}
          ${this.#pathRow("textures.slotFlourish", L("editor.texSlotFlourish"), tx.slotFlourish)}
          ${this.#pathRow("textures.tooltipDrape", L("editor.texTooltipDrape"), tx.tooltipDrape)}
        </details>

        <details class="act-group" ${t.ornaments.length ? "open" : ""}>
          <summary>${L("editor.sectionOrnaments")} <span class="act-mini">${t.ornaments.length}</span></summary>
          <p class="hint">${L("editor.ornamentsHint")}</p>
          ${t.ornaments.map((o, i) => this.#ornamentRow(o, i)).join("")}
          <button type="button" class="act-orn-add" data-action="addOrnament" ${t.ornaments.length >= MAX_ORNAMENTS ? "disabled" : ""}><i class="fas fa-plus"></i> ${L("editor.ornamentAdd")}</button>
        </details>

        <h4 class="act-subhead">${L("editor.sectionArgon")}</h4>
        ${groups}

        <details class="act-group">
          <summary>${L("editor.sectionCss")}</summary>
          <p class="hint">${L("editor.cssHint")}</p>
          <textarea data-path="customCss" rows="8" spellcheck="false" placeholder=".extended-combat-hud .action-element { }">${esc(t.customCss)}</textarea>
        </details>
      </div>
      <footer class="act-footer">
        <button type="button" data-action="saveTheme" class="${this.dirty ? "act-primary" : ""}"><i class="fas fa-save"></i> ${builtin ? L("editor.saveAsCopy") : L("editor.save")}</button>
        <button type="button" data-action="activateTheme"><i class="fas fa-globe"></i> ${L("editor.activate")}</button>
        <button type="button" data-action="revertTheme" ${this.dirty ? "" : "disabled"}><i class="fas fa-undo"></i> ${L("editor.revert")}</button>
        <span class="act-spacer"></span>
        <button type="button" data-action="duplicateTheme" ${this.selectedId ? "" : "disabled"} data-tooltip="${esc(L("editor.duplicate"))}"><i class="fas fa-copy"></i></button>
        <button type="button" data-action="exportTheme" data-tooltip="${esc(L("editor.export"))}"><i class="fas fa-file-export"></i></button>
        <button type="button" data-action="deleteTheme" ${this.selectedId && !builtin ? "" : "disabled"} data-tooltip="${esc(L("editor.delete"))}"><i class="fas fa-trash"></i></button>
      </footer>`;
  }

  /** Kleine Nachbildung des HUDs, damit man auch ohne ausgewählten Token etwas sieht. */
  #renderPreviewBox() {
    const pips = (n, used = 0) => Array.from({ length: n }, (_, i) => `<i class="act-pv-pip ${i < used ? "used" : ""}"></i>`).join("");
    const btn = (cls, label, hover = false) => `<div class="act-pv-btn ${cls} ${hover ? "hover" : ""}">${esc(label)}</div>`;
    return `
      <div class="act-preview">
        <div class="act-pv-label">${L("editor.preview")} <span class="hint">${L("editor.previewHint")}</span></div>
        <div class="act-pv-stage">
          <div class="act-pv-portrait">
            <div class="act-pv-name">Bromm<small>Level 4 Artificer</small></div>
            <div class="act-pv-stats">
              <span class="act-pv-stat"><b class="hp">19</b>/29 HP</span>
              <span class="act-pv-stat">AC <b class="acc">16</b></span>
              <span class="act-pv-stat">DC <b class="acc">14</b></span>
            </div>
          </div>
          <div class="act-pv-side">
            <div class="act-pv-pbtn">${L("editor.pvLongRest")}</div>
            <div class="act-pv-pbtn">${L("editor.pvShortRest")}</div>
          </div>
          <div class="act-pv-actions">
            <div class="act-pv-col">
              <div class="act-pv-bar">${L("editor.pvAction")} ${pips(1)}</div>
              <div class="act-pv-row">${btn("main", L("editor.pvAttack"))}${btn("main", L("editor.pvHover"), true)}</div>
            </div>
            <div class="act-pv-col">
              <div class="act-pv-bar">${L("editor.pvBonus")} ${pips(1, 1)}</div>
              <div class="act-pv-row">${btn("bonus", L("editor.pvFeature"))}</div>
            </div>
            <div class="act-pv-col">
              <div class="act-pv-bar">${L("editor.pvReaction")} ${pips(1)}</div>
              <div class="act-pv-row">${btn("reaction", L("editor.pvCast"))}</div>
            </div>
            <div class="act-pv-col">
              <div class="act-pv-bar">&nbsp;</div>
              <div class="act-pv-row">${btn("free", L("editor.pvItem"))}${btn("endTurn", L("editor.pvEndTurn"))}</div>
            </div>
          </div>
          <div class="act-pv-move">
            <span class="act-pv-move-txt"><b class="acc">25</b> ft</span>
            <span class="act-pv-space used"></span><span class="act-pv-space base"></span><span class="act-pv-space base"></span>
            <span class="act-pv-space dash"></span><span class="act-pv-space danger"></span>
          </div>
          <div class="act-pv-tooltip">
            <div class="act-pv-tt-head">Fire Bolt</div>
            <div class="act-pv-tt-sub">${L("editor.pvCantrip")}</div>
            <div class="act-pv-tt-body">1d10 ${L("editor.pvFire")} · 120 ft</div>
          </div>
          <div class="act-pv-slots">${L("editor.pvSlots")} <i class="act-pv-pip"></i><i class="act-pv-pip"></i><i class="act-pv-pip used"></i></div>
          <div class="act-pv-dialog"><span class="act-pv-dbtn">${L("editor.pvButton")}</span><span class="act-pv-dbtn hover">${L("editor.pvHover")}</span></div>
        </div>
      </div>`;
  }

  /** Überträgt die Arbeitskopie als CSS-Variablen auf die Vorschau. */
  #updatePreviewBox() {
    const box = this.element?.querySelector(".act-pv-stage");
    if (!box) return;
    const t = this.working;
    for (const [k, v] of Object.entries(t.colors)) box.style.setProperty(`--ech-${k}`, v);
    for (const [k, v] of Object.entries(t.extras)) box.style.setProperty(`--act-${k}`, v);
    const s = t.style;
    box.style.setProperty("--act-radius", `${s.radius}px`);
    box.style.setProperty("--act-border", `${s.borderWidth}px`);
    box.style.setProperty("--act-font", s.font ? `"${s.font.replace(/"/g, "")}", var(--font-primary), sans-serif` : "inherit");
    box.style.setProperty("--act-font-scale", s.fontScale / 100);
    box.style.setProperty("--act-glow", s.hoverGlow ? `0 0 ${s.glowSize}px ${s.glowColor}, inset 0 0 ${Math.round(s.glowSize / 2)}px ${s.glowColor}` : "none");
    box.style.setProperty("--act-text-shadow", s.textShadow ? "0 0 4px #000, 0 1px 2px #000" : "none");
    box.style.setProperty("--act-portrait-frame", s.portraitFrame
      ? `0 0 ${Math.max(6, s.glowSize)}px ${t.colors["portrait-base-border"]}, inset 0 0 18px #000000aa` : "none");
    box.style.setProperty("--act-portrait-border", s.portraitFrame ? `${Math.max(1, s.borderWidth)}px` : `${s.borderWidth}px`);

    const tx = t.textures;
    // Volle Adresse bilden: Variablen werden sonst relativ zur CSS-Datei aufgelöst
    const url = (p) => {
      if (!p) return "none";
      let href = p;
      try { href = new URL(p, document.baseURI).href; } catch { /* Pfad unverändert */ }
      return `url("${href.replace(/["\\]/g, "")}")`;
    };
    box.style.setProperty("--act-tex-panel", url(tx.panel));
    box.style.setProperty("--act-tex-panel-size", `${tx.panelSize}px`);
    box.style.setProperty("--act-tex-tooltip", url(tx.tooltip));
    box.style.setProperty("--act-frame", url(tx.frame));
    box.style.setProperty("--act-frame-slice", tx.frameSlice);
    box.style.setProperty("--act-frame-w", `${tx.frameWidth}px`);
    box.style.setProperty("--act-bframe", url(tx.buttonFrame));
    box.style.setProperty("--act-bframe-slice", tx.buttonFrameSlice);
    box.style.setProperty("--act-bframe-w", `${tx.buttonFrameWidth}px`);
    box.style.setProperty("--act-seal", url(tx.seal));
    box.classList.toggle("tx-frame", !!tx.frame);
    box.classList.toggle("tx-bframe", !!tx.buttonFrame);
    box.classList.toggle("tx-seal", !!tx.seal);
  }

  /* -------------------------------------------- */
  /*  Eingaben                                    */
  /* -------------------------------------------- */

  #onInput(event, committed = false) {
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;

    const row = el.closest(".act-color");
    if (row) {
      const path = row.dataset.path;
      const rgbInput = row.querySelector(".act-rgb");
      const alphaInput = row.querySelector(".act-alpha");
      const hexInput = row.querySelector(".act-hex");
      let value;
      if (el === hexInput) {
        if (!committed && !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(el.value.trim())) return;
        value = toHex8(el.value, foundry.utils.getProperty(this.working, path));
        const { rgb, alpha } = splitHex8(value);
        rgbInput.value = rgb;
        alphaInput.value = alpha;
        if (committed) hexInput.value = value;
      } else if (el === rgbInput || el === alphaInput) {
        value = joinHex8(rgbInput.value, alphaInput.value);
        hexInput.value = value;
      } else return;
      row.querySelector(".act-alpha-val").textContent = `${alphaInput.value}%`;
      row.querySelector(".act-swatch > span").style.background = value;
      this.#set(path, value);
      return;
    }

    const path = el.dataset.path;
    if (!path) return;
    let value;
    if (el.type === "checkbox") value = el.checked;
    else if (el.type === "range") {
      value = Number(el.value);
      const out = el.parentElement.querySelector(".act-range-val");
      if (out) out.textContent = `${value}${out.dataset.unit ?? ""}`;
    } else if (el.type === "number") {
      value = Number(el.value);
      if (!Number.isFinite(value)) return;
    } else value = el.value;

    // Name und eigenes CSS nur beim Verlassen des Feldes übernehmen (flüssigeres Tippen)
    const isPath = (path.startsWith("textures.") || path.startsWith("ornaments.")) && el.type === "text";
    const commitOnly = path === "customCss" || path === "name" || isPath;
    if (commitOnly && !committed) {
      foundry.utils.setProperty(this.working, path, value);
      this.#markDirty();
      return;
    }
    this.#set(path, value);
  }

  #set(path, value) {
    foundry.utils.setProperty(this.working, path, value);
    this.#markDirty();
    this.#updatePreviewBox();
    setPreview(this.working);
    if (/^ornaments\.\d+\.src$/.test(path)) this.render(); // Vorschaubild aktualisieren
  }

  #markDirty() {
    if (this.dirty) return;
    this.dirty = true;
    // Kennzeichnung ohne komplettes Neu-Rendern (Fokus bleibt erhalten)
    const head = this.element?.querySelector(".act-head");
    if (head && !head.querySelector(".act-dirty")) {
      head.insertAdjacentHTML("beforeend", `<span class="act-dirty" data-tooltip="${esc(L("editor.unsaved"))}"><i class="fas fa-circle"></i></span>`);
    }
    this.element?.querySelector('[data-action="revertTheme"]')?.removeAttribute("disabled");
    this.element?.querySelector('[data-action="saveTheme"]')?.classList.add("act-primary");
  }

  /** Fragt bei ungespeicherten Änderungen nach. true = darf weiter. */
  async #confirmDiscard() {
    if (!this.dirty) return true;
    return DialogV2.confirm({
      window: { title: L("editor.unsavedTitle") },
      content: `<p>${L("editor.unsavedText")}</p>`,
      rejectClose: false,
      modal: true,
    });
  }

  #load(id, theme) {
    this.selectedId = id;
    this.working = foundry.utils.deepClone(theme);
    this.dirty = false;
    this.render();
  }

  /* -------------------------------------------- */
  /*  Aktionen                                    */
  /* -------------------------------------------- */

  static async #onSelect(event, target) {
    const id = target.dataset.id;
    if (!id || id === this.selectedId) return;
    if (!(await this.#confirmDiscard())) return;
    const theme = getTheme(id);
    if (theme) this.#load(id, theme);
  }

  static async #onNew() {
    if (!(await this.#confirmDiscard())) return;
    this.#load(null, this.#blank());
  }

  static async #onFromArgon() {
    if (!(await this.#confirmDiscard())) return;
    const theme = this.#blank(L("editor.fromArgonName"));
    withThemeDisabled(() => {
      const cs = getComputedStyle(document.documentElement);
      for (const key of Object.keys(theme.colors)) {
        const v = cs.getPropertyValue(`--ech-${key}`).trim();
        if (v) theme.colors[key] = toHex8(v, theme.colors[key]);
      }
    });
    this.#load(null, normalizeTheme(theme));
    this.#markDirty();
  }

  static async #onDuplicate() {
    if (!(await this.#confirmDiscard())) return;
    const copy = foundry.utils.deepClone(this.working);
    copy.id = "";
    copy.name = L("editor.copyName", { name: copy.name });
    delete copy.builtin;
    this.#load(null, copy);
    this.#markDirty();
  }

  static async #onDelete() {
    const id = this.selectedId;
    if (!id || isBuiltin(id)) return;
    const ok = await DialogV2.confirm({
      window: { title: L("editor.delete") },
      content: `<p>${L("editor.deleteConfirm", { name: esc(this.working.name) })}</p>`,
      rejectClose: false,
      modal: true,
    });
    if (!ok) return;
    await deleteTheme(id);
    const all = getAllThemes();
    const next = Object.keys(all)[0];
    this.#load(next ?? null, next ? all[next] : this.#blank());
    ui.notifications.info(L("notify.deleted"));
  }

  static async #onSave() {
    const nameInput = this.element.querySelector(".act-name");
    if (nameInput) this.working.name = nameInput.value;
    const css = this.element.querySelector('[data-path="customCss"]');
    if (css) this.working.customCss = css.value;
    // Eine Vorlage wird als Kopie gespeichert – mit eindeutigem Namen
    const preset = this.selectedId && isBuiltin(this.selectedId) ? getTheme(this.selectedId) : null;
    if (preset && this.working.name.trim() === preset.name) {
      this.working.name = L("editor.copyName", { name: preset.name });
    }
    const id = await saveTheme(this.working);
    this.#load(id, getTheme(id));
    ui.notifications.info(L("notify.saved", { name: this.working.name }));
  }

  static async #onRevert() {
    if (this.selectedId) this.#load(this.selectedId, getTheme(this.selectedId));
    else this.#load(null, this.#blank());
  }

  static async #onActivate(event, target) {
    if (target.dataset.id === NONE) {
      await setWorldTheme(NONE);
      ui.notifications.info(L("notify.argonRestored"));
      return this.render();
    }
    let id = this.selectedId;
    if (!id || this.dirty) {
      await ThemeEditor.#onSave.call(this);
      id = this.selectedId;
    }
    await setWorldTheme(id);
    ui.notifications.info(L("notify.activated", { name: getTheme(id)?.name ?? "" }));
    this.render();
  }

  static #onAddOrnament() {
    if (this.working.ornaments.length >= MAX_ORNAMENTS) return;
    this.working.ornaments.push(defaultOrnament());
    this.#markDirty();
    this.render();
  }

  static #onRemoveOrnament(event, target) {
    const i = Number(target.dataset.index);
    this.working.ornaments.splice(i, 1);
    this.#markDirty();
    setPreview(this.working);
    this.render();
  }

  static async #onBrowse(event, target) {
    const path = target.dataset.target;
    const input = this.element.querySelector(`input[data-path="${path}"]`);
    const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
    if (!FP) return;
    const picker = new FP({
      type: "image",
      current: input?.value || `modules/${MODULE_ID}/assets/`,
      callback: (file) => {
        if (input) input.value = file;
        this.#set(path, file);
      },
    });
    if (typeof picker.browse === "function") picker.browse();
    else picker.render({ force: true });
  }

  static async #onExport() {
    const data = normalizeTheme(this.working);
    delete data.builtin;
    data.module = MODULE_ID;
    const slug = (data.name || "theme").toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "-").replace(/^-|-$/g, "");
    const save = foundry.utils.saveDataToFile ?? globalThis.saveDataToFile;
    save(JSON.stringify(data, null, 2), "application/json", `argon-theme-${slug || "export"}.json`);
  }

  static async #onImport() {
    if (!(await this.#confirmDiscard())) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        let data = JSON.parse(await file.text());
        // Argons eigene Theme-Dateien enthalten nur die Farben
        if (!data.colors && data.portrait && data.mainAction) data = { colors: data };
        if (!data.colors) throw new Error("no colors");
        data.id = "";
        data.name ||= file.name.replace(/\.json$/i, "");
        this.#load(null, normalizeTheme(data));
        this.#markDirty();
        ui.notifications.info(L("notify.imported"));
      } catch (err) {
        console.warn(`${MODULE_ID} | Import fehlgeschlagen`, err);
        ui.notifications.error(L("notify.importFailed"));
      }
    }, { once: true });
    input.click();
  }
}
