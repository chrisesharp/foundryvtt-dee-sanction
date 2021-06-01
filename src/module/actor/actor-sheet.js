/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DeeSanctionActorSheet extends ActorSheet {

  /** @override */
  async _onDrop(event) {
    let item;
    try {
      const data = JSON.parse(event.dataTransfer.getData('text/plain'));
      item = game.items.get(data.id);
    } catch (err) {
      return false;
    }
    if (item && item.type==="occupation") {
      this.actor.update({data:{occupation:item.name}});
    }
    return super._onDrop(event);
  }

  /** @override */
  getData() {
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

    // Item summaries
    html
      .find('.item .item-name')
      .click((event) => this._onItemSummary(event));
    
    // Rollable abilities.
    // html.find('.rollable').click(this._onRoll.bind(this));
    html.find('.rollable').click(this._onRoll.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item-entry");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item-entry");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Step up die.
    html.find('a.step-up').click(async (event) => {
      event.preventDefault();
      const resource = event.currentTarget.parentElement.dataset.resource;
      return this._updateResource(resource, 1);
    });

    // Step down die.
    html.find('a.step-down').click(async (event) => {
      event.preventDefault();
      const resource = event.currentTarget.parentElement.dataset.resource;
      return this._updateResource(resource, -1);
    });

    // Tradecraft select
    html.find('#tradecraft-sel').change(async (event)=> {
      event.preventDefault();
      const opt = $('#tradecraft-sel').val();
      const trade = CONFIG.DEE.tradecraft[opt]; 
      const newData = {tradecraft:trade};
      return this.actor.update({data:newData});
    });
  }

  /**
   * Handle updating an actor's resource
   * @param {String} resource   The name of the resource
   * @param {Number} delta  The amount (positive or negative) to adjust the resource by
   * @private
   */
  _updateResource(resource, delta) {
    const resources = duplicate(this.actor.data.data.resources);
    const newData = {};
    resources[resource].value = (delta > 0) ? Math.min(resources[resource].value + delta, 5) : Math.max(resources[resource].value + delta, 0)
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
   * Handle adding a summary description for an Item
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemSummary(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item-entry");
    const item = this.actor.getOwnedItem(li.data("item-id"));
    const description = TextEditor.enrichHTML(item.data.data.description);
    const abilities = this.actor.getAbilities();
    let options="";
    if (item.type==="association"||item.type==="focus"||item.type==="occupation") {
      item.data.data.abilities.forEach((i)=> {
        let ability = abilities.filter(e => e.name===i.name);
        const checked = (ability.length > 0) ? " checked " : "";
        options += `<input type="checkbox" id="${i.id}" ${checked} onclick="return false;"><label for="${i.id}">${i.name}</label> `
      });
    }
    // Toggle summary
    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      // Add item tags
      let div = $(
        `<div class="item-summary">
        <div>
        ${description}
        </div>
        ${options}
        </div>`
      );
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const resource = element.dataset.resource;
    const dataset = element.dataset;
    let target;
    for (let t of game.user.targets.values()) {
      const data = t.actor.data;
      target = {
        id: data.id,
        armour: data.data.resources.armour.value,
      }
      if (data.type === "enemy") {
        target.potency = data.data.resistance.potency;
        target.hitresolution = data.data.hitresolution;
      }
      break;
    }

    if (dataset.roll) {
      if (resource == "armour") {
        this.actor.rollResistance(resource, dataset.roll);
      } else {
        this.actor.rollChallenge(resource, dataset.roll, target);
      }
    }
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
   _prepareItems(data) {
    // Partition items by category
    let [items, abilities, consequences, associations, favours, foci, occupations] = data.items.reduce(
      (arr, item) => {
        // Classify items into types
        if (item.type === "item") arr[0].push(item);
        else if (item.type === "ability") arr[1].push(item);
        else if (item.type === "consequence") arr[2].push(item);
        else if (item.type === "association") arr[3].push(item);
        else if (item.type === "favour") arr[4].push(item);
        else if (item.type === "focus") arr[5].push(item);
        else if (item.type === "occupation") arr[6].push(item);
        return arr;
      },
      [[], [], [], [], [], [], []]
    );

    // Assign and return
    data.owned = {
      items : items,
      abilities : abilities,
      consequences : consequences,
      associations: associations,
      favours: favours,
      foci: foci,
      occupations: occupations
    };
  }
}
