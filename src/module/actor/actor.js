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

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;
    Object.keys(actorData.data.resources).forEach(key => {
      const res = actorData.data.resources[key];
      let upper = (key === "armour") ? 6 : 5;
      let lower = (key === "armour") ? 1 : 0;
      res.value = Math.min(Math.max(res.value, lower), upper);
    });
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    switch (actorData.type) {
      case "agent":
        this._prepareAgentData(actorData);
        break;
      case "enemy":
        this._prepareEnemyData(actorData);
        break;
    }
  }

  // Armour is not cumulative in effect, so disable the weaker ones
  // Effectiveness is measured as larger negative number
  /** @override */
  applyActiveEffects() {
    const armourEffects = {};
    let mostEffective = 0;
    let mostEffectiveId;
    this.effects.forEach (e=> {
      let armourChanges = e.data.changes.filter(x=>(x.key === "data.resources.armour.value"));
      if (armourChanges.length) {
        armourEffects[e.id] = e;
        let value = parseInt(e.data.changes[0].value)
        if (value < mostEffective) {
          mostEffective = value;
          mostEffectiveId = e.id;
        }
      }
    });

    Object.keys(armourEffects).forEach((id) => {
      armourEffects[id].data.disabled = (mostEffectiveId != id);
    });
    super.applyActiveEffects();
  }

  _categoriseItems(items) {
    return items.reduce(
      (acc, item) => {
        let category = acc[item.type] || [];
        category.push(item);
        acc[item.type] = category;
        return acc;
      },
      {"item":[],"ability":[],"consequence":[],"association":[],"favour":[],"focus":[],"occupation":[]}
    );
  }
  /**
   * Prepare Character type specific data
   */
  async _prepareAgentData(actorData) {
    const data = actorData.data;
    const categories = this._categoriseItems(actorData.items);
    data.possessions = { mundane: categories["item"].filter(i => !i.data.data.esoteric), esoteric: categories["item"].filter(i => i.data.data.esoteric)};
    data.abilities = categories["ability"];
    data.consequences = categories["consequence"];
    data.expertise = { foci: categories["focus"], occupations: categories["occupation"]};
    data.affiliations = categories["association"];
    data.favours = categories["favour"];
    await actorData.token.update({disposition:1, actorLink:true});
  }

  /**
   * Prepare Character type specific data
   */
  async _prepareEnemyData(actorData) {
    const data = actorData.data;
    const categories = this._categoriseItems(actorData.items);
    data.possessions = { mundane: categories["item"].filter(i => !i.data.data.esoteric), esoteric: categories["item"].filter(i => i.data.data.esoteric)};
    data.abilities = categories["ability"];
    data.consequences = categories["consequence"];
    await actorData.token.update({disposition:-1});
  }

  async rollChallenge(resource, step, target = {}) {
    step=parseInt(step);
    let potency = 0;
    if (target.id) {
      potency += parseInt(target.potency);
      let targetConsequences = target.consequences.reduce((acc, item) => { 
        return (item.data.data.resource===resource) ? acc + item.data.data.potency: acc;
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
      actor: this.data,
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
      actor: this.data,
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
    return rt.draw({roll:await roll.evaluate({async:"true"})});
  }

  async rollUnravelling(step) {
    step=parseInt(step);
    const die = "d" + (2 + (2 * step));
    let label = game.i18n.localize("DEE.ChallengeRoll");
    label += game.i18n.localize(`DEE.resource.unravel.long`);
    const details = game.i18n.format("DEE.roll.details.resource", {type: label});
    const rollParts = [die];
    const data = {
      actor: this.data,
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
    return this.data.items.filter(i=>i.type==="ability");
  }
}