// Import Modules
import { DeeSanctionRollTable } from "./rolltable/rolltable.js";
import { DeeSanctionActor } from "./actor/actor.js";
import { DeeSanctionAgentSheet } from "./actor/agent-sheet.js";
import { DeeSanctionEnemySheet } from "./actor/enemy-sheet.js";
import { DeeSanctionItem } from "./item/item.js";
import { DeeSanctionItemSheet } from "./item/item-sheet.js";
import { preloadHandlebarsTemplates } from "./preload-templates.js";
import { registerHandlebarHelpers } from "./handlebar-helpers.js";
import { DEE } from "./config.js";
import { registerSettings } from "./settings.js";
import { loadCompendia } from "./load-compendia.js"
import { DeeCombat } from "./combat.js";
import * as chat from "./chat.js";

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
  CONFIG.RollTable.documentClass = DeeSanctionRollTable;

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
      let stage1 = await loadCompendia(["Abilities","Consequences","Clothing","Odds and Ends", "Printed Matter", "Tools", "Weapons","Favours"]);
      console.log("Stage 1: Compendia imported:",stage1)
      // Load containers
      let stage2 = await loadCompendia(["Associations","Foci","Occupations","Humours"]);
      console.log("Stage 2: Compendia imported:",stage2)
      // Load other tables
      let stage3 = await loadCompendia(["Outcomes"]);
      console.log("Stage 3: Compendia imported:",stage3)
    }

  //show welcome dialog and set initialized to true
    let d = new Dialog({
      title: "Welcome to the Dee Sanction",
      content: "<This>The first time you create a world, you must import the compendia. This will take a little time.</p>",
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