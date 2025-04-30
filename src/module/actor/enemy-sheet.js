import {DeeSanctionActorSheet} from "./actor-sheet.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {DeeSanctionActorSheet}
 */
export class DeeSanctionEnemySheet extends DeeSanctionActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ['dee', 'sheet', 'actor', 'enemy'],
    position: {
      width: 400,
      height: 500,
    },
  }

  static PARTS = {
    header: {
      template: 'systems/dee/templates/actor/partials/enemy-header.hbs',
    },
    tabs: {
      template: 'systems/dee/templates/actor/partials/enemy-nav.hbs',
    },
    resistance: {
      template: 'systems/dee/templates/actor/partials/enemy-resistance.hbs',
    },
    abilities: {
      template: 'systems/dee/templates/actor/partials/enemy-abilities.hbs',
    },
    resolution: {
      template: 'systems/dee/templates/actor/partials/enemy-resolution.hbs',
    }
  };

  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'resistance';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'DEE.tabs.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        default:
          tab.id = partId;
          tab.label += partId;
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
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
          description: rt.description,
          img: rt.img
        }
      }
    };
    return this.actor.update({system:newTable});
  }  
}