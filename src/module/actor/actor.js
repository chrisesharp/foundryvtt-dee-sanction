import {DeeSanctionDice} from "../dice.js";
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class DeeSanctionActor extends Actor {
  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'agent') this._prepareCharacterData(actorData);
    if (actorData.type === 'enemy') this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    //const data = actorData.data;
  }

  rollChallenge(resource, step, target = {}) {
    step=parseInt(step)
    let potency = 0;
    if (target.id) {
      potency = parseInt(target.potency);
      step = (potency > 0) ? Math.min(step + potency, 5) : Math.max(step + potency, 0);
    }
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

  rollResistance(resource, step, options = {}) {
    const die = "d" + (2 + (2 * step));
    let label = game.i18n.localize("DEE.ChallengeRoll");
    if (resource) {
      label += game.i18n.localize(`DEE.resource.${resource}.long`);
    }
    const rollParts = [die];

    const data = {
      actor: this.data,
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

  rollConsequence(rollTable, attacking=true) {
    const rt = game.tables.get(rollTable);
    let roll = (attacking === "true") ? new Roll("1d8").roll() : new Roll("1d6+2").roll();
    return rt.draw({roll:roll});
  }

  getAbilities() {
    return this.data.items.filter(i=>i.type==="ability");
  }
}