import { DeeSanctionItemSheet } from "./item-sheet.js";

export class DeeSanctionAssociationItemSheet extends DeeSanctionItemSheet {

  static PARTS = {
    header: {
      template: 'systems/dee/templates/item/partials/item-sheet-generic-header.hbs',
    },
    tabs: {
      template: 'systems/dee/templates/item/partials/item-sheet-nav.hbs',
    },
    abilities: {
      template: 'systems/dee/templates/item/partials/item-sheet-abilities.hbs',
    },
    notes: {
      template: 'systems/dee/templates/item/partials/item-sheet-notes.hbs',
    },
    effects: {
      template: 'systems/dee/templates/item/partials/item-sheet-effects.hbs',
    },
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    if (this.document.limited) return;
    options.parts.push('abilities');
  }

  async _prepareContext(options) {
      const data = await super._prepareContext(options);
      data.hasAbilities = true;
      return data;
  }
}