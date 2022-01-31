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
import { loadCompendia, unloadCompendia } from "./load-compendia.js"
import { DeeCombat } from "./combat.js";
import { addChatConsequenceButton } from "./chat.js";
import * as party from "./party.js";
import { DeeSanctionDice } from "./dice.js";
import { Logger } from "./logger.js";

const log = new Logger();

Hooks.once('init', async function() {
  log.info("Invoking The Dee Sanction...");
  game.dee = {
    DeeSanctionActor,
    DeeSanctionItem,
    DeeSanctionDice
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
  CONFIG.DEE.showEffects = game.settings.get("dee","effects-tab");

});

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("ready", async function () {
    // Load leaf node documents
    if (!game.user.isGM) return;
    const stage1 = ["Abilities","Armour","Consequences","Clothing","Odds and Ends", "Printed Matter", "Tools", "Weapons","Favours"];
    const stage2 = ["Associations","Foci","Occupations","Humours"];
    const stage3 = ["Outcomes","NPCs","Macros"];
    const stages = [stage1, stage2, stage3];
    const doAll = async (f, initialized) => {
      for (let i=0; i < stages.length; i++) {
        await f(stages[i]);
        log.debug("Processed:",stages[i]);
      }
      game.settings.set("dee","initialized",initialized);
    }

    const template = "/systems/dee/templates/dialog/welcome.html";
    const content = await renderTemplate(template);
    //show welcome dialog and set initialized to true
    let d = new Dialog({
      title: "Welcome to the Dee Sanction",
      content: content,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Import Now",
          callback: () => doAll(loadCompendia, true)
        },
        two: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Delete All",
          callback: () => doAll(unloadCompendia, false)
        },
        three: {
          icon: '<i class="fas fa-times"></i>',
          label: "Don't show this again",
          callback: () => game.settings.set("dee","initialized",true)
        }
      },
      default: "one"
    }, {
      width: 550,
      height: 230,
      resizable: false,
    });

    if (!game.settings.get("dee","initialized")) {
      d.render(true);
    }

});

Hooks.on("renderChatMessage", addChatConsequenceButton);
Hooks.on("renderCombatTracker", DeeCombat.format);
Hooks.on("preCreateCombatant", (combatant, data, options, id) => {
    DeeCombat.addCombatant(combatant, data, options, id);
});
Hooks.on("getCombatTrackerEntryContext", DeeCombat.addContextEntry);

// License and KOFI infos
Hooks.on("renderSidebarTab", async (object, html) => {
  if (object instanceof ActorDirectory) {
    party.addControl(object, html);
  }

  if (object instanceof Settings) {
    let gamesystem = html.find("#game-details");
    // License text
    const template = "systems/dee/templates/chat/license.html";
    const rendered = await renderTemplate(template);
    gamesystem.find(".system").append(rendered);
    
    // User guide
    let docs = html.find("button[data-action='docs']");
    const styling = "border:none;margin-right:2px;vertical-align:middle;margin-bottom:5px";
    $(`<button data-action="userguide"><img src='/systems/dee/assets/default/icons/magic.png' width='16' height='16' style='${styling}'/>Dee Sanction Guide</button>`).insertAfter(docs);
    html.find('button[data-action="userguide"]').click(ev => {
      new FrameViewer('https://chrisesharp.github.io/foundryvtt-dee-sanction', {resizable: true}).render(true);
    });
  }
});