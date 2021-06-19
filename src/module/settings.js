export const registerSettings = function () {
    console.log("Registering Dee System Settings");
    game.settings.register("dee", "initialized", {
        name: game.i18n.localize("DEE.Setting.initialized"),
        hint: game.i18n.localize("DEE.Setting.initializedHint"),
        default: false,
        scope: "world",
        type: Boolean,
        config: true,
        // onChange: _ => window.location.reload()
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