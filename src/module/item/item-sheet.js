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
  _onDragStart(event) {
    const div = event.currentTarget;
    // Create drag data
    const dragData = { };
    const itemId = div.dataset.entityId;
    
    // Owned Items
    if ( itemId ) {
      const item = game.items.get(itemId);
      dragData.type = "Item";
      dragData.data = item.data;
    }

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
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
    abilities.push(ability);
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
    // Add ability
    // TODO when on 8.x
    //html.find('.item-create').click(this._onAbilityCreate.bind(this));

    // Update ability Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item-entry");
      const item = game.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete ability Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item-entry");
      this._onAbilityDelete(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onAbilityCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New Ability`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: "ability",
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];
    // Finally, create the item!
    // TODO use the 8.x createEmbeddedDocuments() api
    console.log("TODO create embedded ability")
    //return this.item.createEmbeddedEntity("DeeSanctionItem", itemData);
  }

  /**
   * Handle deleting an ability Item
   * @param {String} id   the id of the ability
   * @private
   */
  _onAbilityDelete(id) {
    const abilities = this.item.data.data.abilities.filter((i)=>i._id != id);
    const newAbilities = {
      abilities: abilities
    }
    return this.item.update({data: newAbilities});

    // TODO use the 8.x deleteEmbeddedDocuments() api

  }
}
