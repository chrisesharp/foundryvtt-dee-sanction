import {DeeSanctionActorSheet} from "./actor-sheet.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {DeeSanctionActorSheet}
 */
export class DeeSanctionEnemySheet extends DeeSanctionActorSheet {
  /** @override */
  static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dee", "sheet", "actor", "enemy"],
      template: "systems/dee/templates/actor/enemy-sheet.html",
      width: 400,
      height: 500,
      resizable: false,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "resistance" }]
      });
  }

  /** @override */
  async _onDrop(event) {
    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {
      return false;
    }
    const actor = this.actor;
    // Handle the drop with a Hooked function
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if ( allowed === false ) return;
    // Handle different data types

    switch ( data.type ) {
      case "Item":
        return this._onDropItem(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "RollTable":
        return this._onDropRollTable(event, data);
    }
  }

  /**
   * Handle dropping of an rolltable reference onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @return {Object}             A data object which describes the result of the drop
   * @private
   */
  async _onDropRollTable(event, data) {
    if ( !this.actor.isOwner ) return false;
    const rt = await fromUuid(data.uuid);
    const newTable = {
      hitresolution: {
        rolltable: {
          uuid: rt.uuid,
          id: rt.id,
          name: rt.name,
          description: rt._source.description,
          img: rt.img
        }
      }
    };
    return this.actor.update({system:newTable});
  }  
}