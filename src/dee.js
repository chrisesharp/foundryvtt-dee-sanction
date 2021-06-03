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

  // Enable hook debug
  // CONFIG.debug.hooks = true;

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

});

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("ready", async function () {
    // Load leaf node documents
    let loadAll = async () => {
      let stage1 = await loadCompendia(["Abilities","Consequences","Items","Favours"]);
      console.log("Stage 1: Compendia imported:",stage1)
      // Load containers
      let stage2 = await loadCompendia(["Associations","Foci","Occupations"]);
      console.log("Stage 2: Compendia imported:",stage2)
      // game.settings.set("dee","initialized",true);
    }

  //show welcome dialog and set initialized to true
    let d = new Dialog({
      title: "Welcome to the Dee Sanction",
      content: "<p>The first time you create a world, you must import the compendia.</p><p>This will take a little time.</p>",
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Import Now",
          callback: () => loadAll()
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: "Don't show this again",
          callback: () => game.settings.set("dee","initialized",true)
        }
      },
      default: "one"
    });

    if (!game.settings.get("dee","initialized")) {
      d.render(true);
    }

});

Hooks.on("renderChatMessage", chat.addChatConsequenceButton);
Hooks.on("renderCombatTracker", DeeCombat.format);
Hooks.on("preCreateCombatant", (combatant, data, options, id) => {
    DeeCombat.addCombatant(combatant, data, options, id);
});
Hooks.on("preUpdateCombat", (combat, data, options, id) => {
  // if (data.round) {
  //   combat.resetAll();
  //   DeeCombat.rollInitiative(combat);
  // }
});
Hooks.on("getCombatTrackerEntryContext", DeeCombat.addContextEntry);