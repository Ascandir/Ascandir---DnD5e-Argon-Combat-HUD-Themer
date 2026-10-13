/**
 * Einstellungen, Theme-Bibliothek und Auswahl des aktiven Themes.
 */
import { MODULE_ID, normalizeTheme } from "./schema.js";
import { BUILTIN_THEMES, THEME_ALIASES } from "./presets.js";
import { applyTheme } from "./apply.js";
import { setDecorTheme } from "./decor.js";

export const NONE = "none";
export const WORLD = "world";

const S = {
  themes: "themes",
  worldTheme: "worldTheme",
  allowPlayerChoice: "allowPlayerChoice",
  clientTheme: "clientTheme",
  editor: "editor",
};

// Werden beim Registrieren übergeben und später nur noch inhaltlich aktualisiert,
// damit das Einstellungsmenü immer die aktuelle Theme-Liste zeigt.
const worldChoices = {};
const clientChoices = {};

let previewTheme = null;

const L = (key) => game.i18n.localize(`${MODULE_ID}.${key}`);

/* -------------------------------------------- */
/*  Registrierung                               */
/* -------------------------------------------- */

export function registerSettings(EditorClass) {
  game.settings.register(MODULE_ID, S.themes, {
    scope: "world",
    config: false,
    type: Object,
    default: {},
    onChange: () => {
      refreshChoices();
      applyCurrentTheme();
    },
  });

  game.settings.registerMenu(MODULE_ID, S.editor, {
    name: `${MODULE_ID}.settings.editor.name`,
    label: `${MODULE_ID}.settings.editor.label`,
    hint: `${MODULE_ID}.settings.editor.hint`,
    icon: "fas fa-palette",
    type: EditorClass,
    restricted: true,
  });

  game.settings.register(MODULE_ID, S.worldTheme, {
    name: `${MODULE_ID}.settings.worldTheme.name`,
    hint: `${MODULE_ID}.settings.worldTheme.hint`,
    scope: "world",
    config: true,
    type: String,
    choices: worldChoices,
    default: NONE,
    onChange: () => applyCurrentTheme(),
  });

  game.settings.register(MODULE_ID, S.allowPlayerChoice, {
    name: `${MODULE_ID}.settings.allowPlayerChoice.name`,
    hint: `${MODULE_ID}.settings.allowPlayerChoice.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: () => applyCurrentTheme(),
  });

  game.settings.register(MODULE_ID, S.clientTheme, {
    name: `${MODULE_ID}.settings.clientTheme.name`,
    hint: `${MODULE_ID}.settings.clientTheme.hint`,
    scope: "client",
    config: true,
    type: String,
    choices: clientChoices,
    default: WORLD,
    onChange: () => applyCurrentTheme(),
  });

  refreshChoices();
}

/** Spieler-Auswahl im Einstellungsmenü ausblenden, solange der SL sie nicht erlaubt. */
export function onRenderSettingsConfig(app, html) {
  refreshChoices();
  if (game.user.isGM) return;
  if (game.settings.get(MODULE_ID, S.allowPlayerChoice)) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  const input = root?.querySelector(`[name="${MODULE_ID}.${S.clientTheme}"]`);
  input?.closest(".form-group")?.remove();
}

/* -------------------------------------------- */
/*  Bibliothek                                  */
/* -------------------------------------------- */

export function getCustomThemes() {
  let raw = {};
  try {
    raw = game.settings.get(MODULE_ID, S.themes) ?? {};
  } catch {
    raw = {};
  }
  const out = {};
  for (const [id, data] of Object.entries(raw)) {
    if (!data) continue;
    const t = normalizeTheme({ ...data, id });
    out[id] = t;
  }
  return out;
}

export function getAllThemes() {
  return { ...BUILTIN_THEMES, ...getCustomThemes() };
}

export function getTheme(id) {
  if (!id || id === NONE) return null;
  id = THEME_ALIASES[id] ?? id;
  return BUILTIN_THEMES[id] ?? getCustomThemes()[id] ?? null;
}

export function isBuiltin(id) {
  return !!BUILTIN_THEMES[id];
}

/** Speichert ein eigenes Theme (nur SL). Gibt die ID zurück. */
export async function saveTheme(theme) {
  const clean = normalizeTheme(theme);
  if (!clean.id || isBuiltin(clean.id)) clean.id = foundry.utils.randomID();
  if (!clean.name.trim()) clean.name = L("editor.untitled");
  delete clean.builtin;
  const lib = foundry.utils.deepClone(game.settings.get(MODULE_ID, S.themes) ?? {});
  lib[clean.id] = clean;
  await game.settings.set(MODULE_ID, S.themes, lib);
  return clean.id;
}

export async function deleteTheme(id) {
  if (isBuiltin(id)) return;
  const lib = foundry.utils.deepClone(game.settings.get(MODULE_ID, S.themes) ?? {});
  delete lib[id];
  await game.settings.set(MODULE_ID, S.themes, lib);
  if (game.settings.get(MODULE_ID, S.worldTheme) === id) {
    await game.settings.set(MODULE_ID, S.worldTheme, NONE);
  }
}

export function getWorldThemeId() {
  return game.settings.get(MODULE_ID, S.worldTheme);
}

export async function setWorldTheme(id) {
  await game.settings.set(MODULE_ID, S.worldTheme, id ?? NONE);
}

/* -------------------------------------------- */
/*  Auswahllisten                               */
/* -------------------------------------------- */

/** Namen der Vorlagen in der eingestellten Foundry-Sprache. */
export function localizeBuiltinNames() {
  if (typeof game.i18n?.has !== "function") return;
  for (const t of Object.values(BUILTIN_THEMES)) {
    const key = `${MODULE_ID}.themes.${t.id}`;
    if (game.i18n.has(key)) t.name = game.i18n.localize(key);
  }
}

export function refreshChoices() {
  localizeBuiltinNames();
  const rank = (t) => (t.builtin ? (t.group ? 1 : 0) : 2);
  const themes = Object.values(getAllThemes()).sort((a, b) => rank(a) - rank(b) || (rank(a) === 1 ? 0 : a.name.localeCompare(b.name)));
  const fill = (target, head) => {
    for (const k of Object.keys(target)) delete target[k];
    Object.assign(target, head);
    for (const t of themes) target[t.id] = t.name;
  };
  fill(worldChoices, { [NONE]: L("choices.none") });
  fill(clientChoices, { [WORLD]: L("choices.world"), [NONE]: L("choices.none") });
}

/* -------------------------------------------- */
/*  Anwenden                                    */
/* -------------------------------------------- */

export function resolveActiveThemeId() {
  const worldId = game.settings.get(MODULE_ID, S.worldTheme);
  if (game.settings.get(MODULE_ID, S.allowPlayerChoice)) {
    const clientId = game.settings.get(MODULE_ID, S.clientTheme);
    if (clientId && clientId !== WORLD) {
      if (clientId === NONE || getTheme(clientId)) return clientId;
    }
  }
  return worldId;
}

export function applyCurrentTheme() {
  const theme = previewTheme ?? getTheme(resolveActiveThemeId());
  applyTheme(theme);
  setDecorTheme(theme);
}

export function setPreview(theme) {
  previewTheme = theme ? normalizeTheme(theme) : null;
  applyCurrentTheme();
}

export function clearPreview() {
  previewTheme = null;
  applyCurrentTheme();
}
