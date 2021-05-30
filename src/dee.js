// Import Modules
import { DeeSanctionActor } from "./module/actor/actor.js";
import { DeeSanctionAgentSheet } from "./module/actor/agent-sheet.js";
import { DeeSanctionEnemySheet } from "./module/actor/enemy-sheet.js";
import { DeeSanctionItem } from "./module/item/item.js";
import { DeeSanctionItemSheet } from "./module/item/item-sheet.js";
import { preloadHandlebarsTemplates } from "./module/preloadTemplates.js";
import { registerHandlebarHelpers } from "./module/handlebarHelpers.js";
import { DEE } from "./module/config.js";
import { registerSettings } from "./module/settings.js";
import { DeeCombat } from "./module/combat.js";
import * as chat from "./module/chat.js";

Hooks.once('init', async function() {

  console.log("Invoking The Dee Sanction...");
  game.dee = {
    DeeSanctionActor,
    DeeSanctionItem
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d2",
    decimals: 2
  };

  // Include global config
  CONFIG.DEE = DEE;

  // Define custom Entity classes
  CONFIG.Actor.entityClass = DeeSanctionActor;
  CONFIG.Item.entityClass = DeeSanctionItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("dee", DeeSanctionAgentSheet, { types: ["agent"], makeDefault: true });
  Actors.registerSheet("dee", DeeSanctionEnemySheet, { types: ["enemy"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("dee", DeeSanctionItemSheet, { makeDefault: true });

  // Register custom handlebar helpers
  registerHandlebarHelpers();

  // Register System-wide settings
  registerSettings();

  await preloadHandlebarsTemplates();
});

Hooks.on("renderChatMessage", chat.addChatConsequenceButton);
Hooks.on("renderCombatTracker", DeeCombat.format);
Hooks.on("preCreateCombatant", (combat, data, options, id) => {
    DeeCombat.addCombatant(combat, data, options, id);
});
Hooks.on("getCombatTrackerEntryContext", DeeCombat.addContextEntry);
Hooks.on("preUpdateCombatant", DeeCombat.updateCombatant);