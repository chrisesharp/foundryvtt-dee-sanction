/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class DeeSanctionItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dee", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      dragDrop: [{
        dragSelector: ".item",
        dropSelector: ".abilities"
      }]
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
    const allowed = Hooks.call("dropItemSheetData", actor, this, data);
    if ( allowed === false ) {
      console.log("dropItemSheetData said no...")
      return;
    }
    // Handle different data types

    switch ( data.type ) {
      case "Item":
        return this._onDropItem(event, data);
    }
  }

  _onDropItem(event, data) {
    if (!this.isEditable) return false;
    const ability = game.items.get(data.id);
    let abilities = this.item.data.data.abilities.filter(a=>a.id != data.id);
    abilities.push({
      name: ability.name,
      id: ability.id,
      img: ability.img
    });
    const newAbilities = {
      abilities: abilities
    }
    return this.item.update({data: newAbilities});
  }

  /** @override */
  get template() {
    const path = "systems/dee/templates/item";
    return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
  }

}
