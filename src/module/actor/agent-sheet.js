import {DeeSanctionActorSheet} from "./actor-sheet.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {DeeSanctionActorSheet}
 */
export class DeeSanctionAgentSheet extends DeeSanctionActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ['dee', 'sheet', 'actor', 'agent'],
        position: {
          width: 450,
          height: 665,
        },
    }

    async _prepareContext(options) {
      const data = await super._prepareContext(options);
      return this._prepareItems(data);
    }
}