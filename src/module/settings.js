import { Logger } from "./logger.js";

const log = new Logger();

export const registerSettings = function () {
    log.info("Registering Dee System Settings");

    game.settings.register("dee", "debug", {
      default: false,
      scope: "world",
      type: Boolean,
      config: false,
    });

    game.settings.register("dee", "use-sight", {
      name: game.i18n.localize("DEE.Setting.useSight"),
      hint: game.i18n.localize("DEE.Setting.useSightHint"),
      default: true,
      scope: "world",
      type: Boolean,
      config: true,
      onChange: _ => window.location.reload()
    });

    game.settings.register("dee", "initialized", {
        name: game.i18n.localize("DEE.Setting.initialized"),
        hint: game.i18n.localize("DEE.Setting.initializedHint"),
        default: false,
        scope: "world",
        type: Boolean,
        config: true,
      });

    game.settings.register("dee", "effects-tab", {
        name: game.i18n.localize("DEE.Setting.effectsTab"),
        hint: game.i18n.localize("DEE.Setting.effectsTabHint"),
        default: false,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: _ => window.location.reload()
      });
}