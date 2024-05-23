import {DeeSanctionDice} from "../dice.js";
import { DeeSanctionRollTable } from "../rolltable/rolltable.js";
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class DeeSanctionActor extends Actor {
  /**
   * Augment the basic actor data with additional dynamic data.
   */
  /** @override */
  prepareData() {
    super.prepareData();

    const actorData = this.system;
    const data = actorData;
    const flags = this.flags;
    Object.keys(actorData.resources).forEach(key => {
      const res = actorData.resources[key];
      let upper = (key === "armour") ? 6 : 5;
      let lower = (key === "armour") ? 1 : 0;
      res.value = Math.min(Math.max(res.value, lower), upper);
    });
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    switch (this.type) {
      case "agent":
        this._prepareAgentData();
        break;
      case "enemy":
        this._prepareEnemyData();
        break;
    }
  }

  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    data.prototypeToken = data.prototypeToken || {};

    const disposition =
      data.type === 'agent' ? CONST.TOKEN_DISPOSITIONS.FRIENDLY : CONST.TOKEN_DISPOSITIONS.HOSTILE;
    // Set basic token data for newly created actors.

    foundry.utils.mergeObject(
      data.prototypeToken,
      {
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        actorLink: true,
        disposition: disposition,
        lockRotation: true,
      },
      { overwrite: true },
    );

    this.updateSource(data);
  }

  // Armour is not cumulative in effect, so disable the weaker ones
  // Effectiveness is measured as larger negative number
  /** @override */
  applyActiveEffects() {
    const armourEffects = {};
    let mostEffective = 0;
    let mostEffectiveId;
    this.effects.forEach (e=> {
      let armourChanges = e.changes.filter(x=>(x.key === "resources.armour.value"));
      if (armourChanges.length) {
        armourEffects[e.id] = e;
        let value = parseInt(e.changes[0].value)
        if (value < mostEffective) {
          mostEffective = value;
          mostEffectiveId = e.id;
        }
      }
    });

    Object.keys(armourEffects).forEach((id) => {
      armourEffects[id].disabled = (mostEffectiveId != id);
    });
    super.applyActiveEffects();
  }

  // _categoriseItems(items) {
  //   return items.reduce(
  //     (acc, item) => {
  //       let category = acc[item.type] || [];
  //       category.push(item);
  //       acc[item.type] = category;
  //       return acc;
  //     },
  //     {"item":[],"ability":[],"consequence":[],"association":[],"favour":[],"focus":[],"occupation":[],"hitresolution":[]}
  //   );
  // }
  /**
   * Prepare Character type specific data
   */
  async _prepareAgentData() {
    const data = this.system;
    data.possessions = { mundane: this.itemTypes["item"].filter(i => !i.system.esoteric), esoteric: this.itemTypes["item"].filter(i => i.system.esoteric)};
    data.abilities = this.itemTypes['ability'];
    data.consequences = this.itemTypes['consequence'];
    data.expertise = { foci: this.itemTypes["focus"], occupations: this.itemTypes["occupation"]};
    data.associations = this.itemTypes['association'];
    data.favours = this.itemTypes['favour'];
  }

  /**
   * Prepare Character type specific data
   */
  async _prepareEnemyData(actorData) {
    const data = this.system;
    data.possessions = { mundane: this.itemTypes["item"].filter(i => !i.system.esoteric), esoteric: this.itemTypes["item"].filter(i => i.system.esoteric)};
    data.abilities = this.itemTypes['ability'];
    data.consequences = this.itemTypes['consequence'];
    
    if (game.tables && data.hitresolution.rolltable?.id === "") {
      const hitresolution = findHitResolutionTable(data.hitresolution);
      data.hitresolution = hitresolution;
    }
  }

  async rollChallenge(resource, step, target = {}) {
    step=parseInt(step);
    let potency = 0;
    if (target.id) {
      potency += parseInt(target.potency);
      let targetConsequences = target.consequences.reduce((acc, item) => { 
        return (item.system.resource===resource) ? acc + item.system.potency: acc;
      }, 0);
      potency -= targetConsequences;
    }
    step = (potency > 0) ? Math.min(step + potency, 5) : Math.max(step + potency, 0);
    const die = "d" + (2 + (2 * step));
    let label = game.i18n.localize("DEE.ChallengeRoll");
    if (resource) {
      label += game.i18n.localize(`DEE.resource.${resource}.long`);
    }
    const rollParts = [die];

    const details = (potency == 0) ?  game.i18n.format("DEE.roll.details.resource", {type: label}) : 
                                      game.i18n.format("DEE.roll.details.potency", {potency: potency});
    const data = {
      actor: this.system,
      rollType: "challenge",
      roll: {
        type: "above",
        step: step,
        target: 3,
      },
      details: details,
      target: target
    };

    // Roll and return
    return DeeSanctionDice.Roll({
      parts: rollParts,
      data: data,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `flavour ${label}`,
      title: label
    });
  }

  async rollResistance(resource, step, options = {}) {
    const die = "d" + (2 + (2 * step));
    let label = game.i18n.localize("DEE.ChallengeRoll");
    if (resource) {
      label += game.i18n.localize(`DEE.resource.${resource}.long`);
    }
    const rollParts = [die];

    const data = {
      actor: this.system,
      rollType: "resistance",
      roll: {
        type: "below",
        step: step,
        target: 2,
      },

      details: game.i18n.format("DEE.roll.details.resistance", {
        type: label,
      }),
    };

    // Roll and return
    return DeeSanctionDice.Roll({
      parts: rollParts,
      data: data,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `flavour ${label}`,
      title: label
    });
  }

  async rollConsequence(rollTable, attacking=true) {
    const rt = game.tables.get(rollTable);
    let roll = (attacking === "true") ? new Roll("1d8"): new Roll("1d6+2");
    return rt.draw({roll:await roll.evaluate()});
  }

  async rollUnravelling(step) {
    step=parseInt(step);
    const die = "d" + (2 + (2 * step));
    let label = game.i18n.localize("DEE.ChallengeRoll");
    label += game.i18n.localize(`DEE.resource.unravel.long`);
    const details = game.i18n.format("DEE.roll.details.resource", {type: label});
    const rollParts = [die];
    const data = {
      actor: this.system,
      rollType: "unravelling",
      roll: {
        type: "above",
        step: step,
        target: 3,
      },
      details: details
    };
    return await DeeSanctionDice.Roll({
      parts: rollParts,
      data: data,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `flavour ${label}`,
      title: label
    });
  }

  async rollUnravellingTable() {
    return DeeSanctionRollTable.drawUnravelling();
  }

  getAbilities() {
    return this.system.abilities;
  }
}

export function findHitResolutionTable(hitresolution) {
  let rt = (hitresolution.rolltable.name) ? game.tables.getName(hitresolution.rolltable.name) : game.tables.getName(CONFIG.DEE.defaultResolution);
  if (rt) {
    return  {
      rolltable: {
          id: rt.id,
          uuid: rt.uuid,
          name: rt.name,
          description: rt.description,
          img: rt.img
      }
    };
  }
}