/**
 * Ascandir - DnD5e Argon Combat HUD Themer
 * Eigene Themes/Skins für das Argon Combat HUD erstellen, speichern und auswählen.
 */
import { MODULE_ID } from "./schema.js";
import {
  registerSettings, registerPermissionGuards, refreshChoices, applyCurrentTheme, onRenderSettingsConfig,
  getAllThemes, getTheme, saveTheme, setWorldTheme,
} from "./store.js";
import { ThemeEditor } from "./editor.js";
import { buildThemeCss } from "./apply.js";
import { registerDecorHooks } from "./decor.js";

Hooks.once("init", () => {
  registerSettings(ThemeEditor);
  registerPermissionGuards();
  registerDecorHooks();
});

Hooks.once("setup", () => {
  refreshChoices();
  applyCurrentTheme();
});

Hooks.once("ready", () => {
  refreshChoices();
  applyCurrentTheme();

  if (!game.modules.get("enhancedcombathud")?.active && game.user.isGM) {
    ui.notifications.warn(game.i18n.localize(`${MODULE_ID}.notify.argonMissing`));
  }

  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    mod.api = {
      openEditor: () => game.user.isGM && new ThemeEditor().render({ force: true }),
      getThemes: () => getAllThemes(),
      getTheme,
      saveTheme,
      setWorldTheme,
      buildThemeCss,
      refresh: applyCurrentTheme,
    };
  }
});

Hooks.on("renderSettingsConfig", onRenderSettingsConfig);
