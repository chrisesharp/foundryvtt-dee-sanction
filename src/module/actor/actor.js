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
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;

    // Make modifications to data here. For example:
    // Loop through ability scores, and add their modifiers to our sheet output.
    // for (let [key, ability] of Object.entries(data.abilities)) {
    //   // Calculate the modifier using d20 rules.
    //   ability.mod = Math.floor((ability.value - 10) / 2);
    // }
  }

  // rollChallenge(resource, options = {}) {
  //   const label = game.i18n.localize(`DEE.resource.${resource}.long`);
  //   const rollParts = [];

  //   const data = {
  //     actor: this.data,
  //     roll: {
  //       type: "challenge",
  //       target: 3,
  //     },

  //     details: game.i18n.format("DEE.roll.details.resource", {
  //       score: label,
  //     }),
  //   };

  //   // Roll and return
  //   return DeeSanctionDice.Roll({
  //     event: options.event,
  //     parts: rollParts,
  //     data: data,
  //     skipDialog: skip,
  //     speaker: ChatMessage.getSpeaker({ actor: this }),
  //     flavor: game.i18n.format("OWB.roll.attribute", { attribute: label }),
  //     title: game.i18n.format("OWB.roll.attribute", { attribute: label }),
  //   });
  // }

}