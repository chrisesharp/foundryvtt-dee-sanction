import {DeeSanctionActorSheet} from "./actor-sheet.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {DeeSanctionActorSheet}
 */
export class DeeSanctionEnemySheet extends DeeSanctionActorSheet {
  constructor(...args) {
      super(...args);
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
    const tableId = data.id;
    const rt = game.tables.get(tableId);
    const newTable = {
      hitresolution: {
        rolltable: {
            id: tableId,
            name: rt.data.name,
            description: rt.data.description,
            img: rt.data.img
        }
      }
    };
    return this.actor.update({data: newTable});
  }  


  /** @override */
  static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
      classes: ["dee", "sheet", "actor", "enemy"],
      template: "systems/dee/templates/actor/enemy-sheet.html",
      width: 400,
      height: 475,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "resistance" }]
      });
  }
}