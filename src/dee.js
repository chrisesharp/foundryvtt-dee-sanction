// Import Modules
import { DeeSanctionActor } from "./module/actor/actor.js";
import { DeeSanctionAgentSheet } from "./module/actor/agent-sheet.js";
import { DeeSanctionEnemySheet } from "./module/actor/enemy-sheet.js";
import { DeeSanctionItem } from "./module/item/item.js";
import { DeeSanctionItemSheet } from "./module/item/item-sheet.js";
import { preloadHandlebarsTemplates } from "./module/preload-templates.js";
import { registerHandlebarHelpers } from "./module/handlebar-helpers.js";
import { DEE } from "./module/config.js";
import { registerSettings } from "./module/settings.js";
import { loadCompendia } from "./module/load-compendia.js"
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
  CONFIG.Actor.documentClass = DeeSanctionActor;
  CONFIG.Item.documentClass = DeeSanctionItem;

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

  // Load leaf node documents
  // let loaded = await loadCompendia(["Abilities","Consequences","Items","Favours"]);

  // Load containers
  // loaded.then(()=>{loadCompendia(["Associations","Foci","Occupations"]);});

});

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("setup", async function () {
//   //show welcome dialog and set initialized to true
//   let d = new Dialog({
//     title: "Test Dialog",
//     content: "<p>You must choose either Option 1, or Option 2</p>",
//     buttons: {
//      one: {
//       icon: '<i class="fas fa-check"></i>',
//       label: "Option One",
//       callback: () => console.log("Chose One")
//      },
//      two: {
//       icon: '<i class="fas fa-times"></i>',
//       label: "Option Two",
//       callback: () => console.log("Chose Two")
//      }
//     },
//     default: "two",
//     render: html => console.log("Register interactivity in the rendered dialog"),
//     close: html => console.log("This always is logged no matter which option is chosen")
//    });
//    d.render(true);
});

Hooks.on("renderChatMessage", chat.addChatConsequenceButton);
Hooks.on("renderCombatTracker", DeeCombat.format);
Hooks.on("preCreateCombatant", (combat, data, options, id) => {
    DeeCombat.addCombatant(combat, data, options, id);
});
Hooks.on("getCombatTrackerEntryContext", DeeCombat.addContextEntry);
Hooks.on("preUpdateCombatant", DeeCombat.updateCombatant);