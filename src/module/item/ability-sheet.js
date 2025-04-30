import { DeeSanctionItemSheet } from "./item-sheet.js";

export class DeeSanctionAbilityItemSheet extends DeeSanctionItemSheet {

  static PARTS = {
    header: {
      template: 'systems/dee/templates/item/partials/item-sheet-generic-header.hbs',
    },
    tabs: {
      template: 'systems/dee/templates/item/partials/item-sheet-nav.hbs',
    },
    notes: {
      template: 'systems/dee/templates/item/partials/item-sheet-notes.hbs',
    },
    effects: {
      template: 'systems/dee/templates/item/partials/item-sheet-effects.hbs',
    },
  };
}