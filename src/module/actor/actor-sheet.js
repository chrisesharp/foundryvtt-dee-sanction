/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DeeSanctionActorSheet extends ActorSheet {

  /* -------------------------------------------- */

  /** @override */
  getData() {
    console.log("In getData")
    const data = super.getData();
    data.config = CONFIG.DEE;
    data.dtypes = ["String", "Number", "Boolean"];
    // Prepare owned items
    this._prepareItems(data);
    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Step up die.
    html.find('a.step-up').click(async (event) => {
      event.preventDefault();
      const resource = event.currentTarget.parentElement.dataset.resource;
      return this._updateResource(resource, 2);
    });

    // Step down die.
    html.find('a.step-down').click(async (event) => {
      event.preventDefault();
      const resource = event.currentTarget.parentElement.dataset.resource;
      return this._updateResource(resource, -2);
    });
  }

  _updateResource(resource, delta) {
    const resources = duplicate(this.actor.data.data.resources);
    const newData = {};
    resources[resource].value = (delta > 0) ? Math.min(resources[resource].value + delta, 12) : Math.max(resources[resource].value + delta, 4)
    newData["resources"] = resources;
    return this.actor.update({data:newData});
  }
  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling a ${dataset.label} challenge`: 'Rolling a challenge';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
   _prepareItems(data) {
    // Partition items by category
    let [items, abilities, afflictions] = data.items.reduce(
      (arr, item) => {
        // Classify items into types
        if (item.type === "item") arr[0].push(item);
        else if (item.type === "ability") arr[1].push(item);
        else if (item.type === "affliction") arr[2].push(item);
        return arr;
      },
      [[], [], []]
    );

    // Assign and return
    data.owned = {
      items: items,
    };
    data.abilities = abilities;
    data.afflictions = afflictions;
    console.log(data);
  }
}
