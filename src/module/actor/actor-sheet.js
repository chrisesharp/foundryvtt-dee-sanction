import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import { generator, randomFavourOrSight, randomPossessions, randomThing } from "../generator.js";
import { findHitResolutionTable } from "./actor.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DeeSanctionActorSheet extends ActorSheet {

  /** @override */
  activateEditor(target, editorOptions, initialContent) {
    // remove some controls to the editor as the space is lacking
    if (target == "data.description") {
      editorOptions.toolbar = "styleselect bullist hr table removeFormat save";
    }
    super.activateEditor(target, editorOptions, initialContent);
  }
  
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
      this.actor.update({system:{occupation:item.name}});
    }
    return super._onDrop(event);
  }

  /** @override */
  getData(opts) {
    const baseData = super.getData(opts);
    // Prepare active effects
    baseData.effects = prepareActiveEffectCategories(this.actor.effects);
    return this._prepareItems(baseData);
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  async _prepareItems(data) {
    const sheetData = {
      title: data.title,
      actor: data.actor,
      config: CONFIG.DEE,
      owner: data.owner,
      editable: data.editable,
      data: data.actor.system,
      effects: data.effects,
      user: game.user
    };
    if (data.actor.type==="enemy") {
      if (sheetData.data.hitresolution.rolltable?.uuid === "") {
        const hitresolution = findHitResolutionTable(sheetData.data.hitresolution);
        sheetData.data.hitresolution = hitresolution;
        await data.actor.update({system:{hitresolution: hitresolution}});
      }
    }
    return sheetData;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Item summaries
    html.find('.item .item-name')
        .click((event) => this._onItemSummary(event));
    
    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // lock sheet
    html.find('#padlock').click(this._onToggleLock.bind(this));

    // Random Mannerism
    html.find('#manner-roll').click(this._onGenerate.bind(this));

    // Random Home
    html.find('#home-roll').click(this._onGenerate.bind(this));

    // Random Name
    html.find('#name-roll').click(this._onGenerate.bind(this));

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Add Inventory Item
    html.find('.item-rnd').click(this._onRandomPossession.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item-entry");
      const item = this.actor.items.get(li.data("item-id"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item-entry");
      let itemID = li.data("item-id");
      this.actor.deleteEmbeddedDocuments("Item", [itemID]);
      li.slideUp(200, () => this.render(false));
    });

    // Step up die.
    html.find('a.step-up').click(async (event) => {
      event.preventDefault();
      const resource = event.currentTarget.parentElement.dataset.resource;
      await this._updateResource(resource, 1);
    });

    // Step down die.
    html.find('a.step-down').click(async (event) => {
      event.preventDefault();
      const resource = event.currentTarget.parentElement.dataset.resource;
      await this._updateResource(resource, -1);
    });

    // Tradecraft select
    html.find('#tradecraft-sel').change(async (event)=> {
      event.preventDefault();
      const opt = $('#tradecraft-sel').val();
      const trade = CONFIG.DEE.tradecraft[opt]; 
      const newData = {tradecraft:trade};
      await this.actor.update({system:newData});
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
  }

  /**
   * Handle updating an actor's resource
   * @param {String} resource   The name of the resource
   * @param {Number} delta  The amount (positive or negative) to adjust the resource by
   * @private
   */
  _updateResource(resource, delta) {
    const resources = foundry.utils.duplicate(this.actor.system.resources);
    const newData = {};
    resources[resource].value += delta; 
    newData["resources"] = resources;
    return this.actor.update({system:newData});
  }
  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
   async _onRandomPossession(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const targetType = $(target).data('type');
    switch (targetType) {
      case "item":
        const template = "/systems/dee/templates/dialog/possessions-dialog.html";
        const content = await renderTemplate(template);
    
        //show welcome dialog and set initialized to true
        let d = new Dialog({
          title: "Randomly choose possessions",
          content: content,
          buttons: {
            one: {
              icon: '<i class="fas fa-check"></i>',
              label: "Randomly Roll for Possessions",
              callback: (html) => { 
                randomPossessions(this.actor, html); 
              }
            },
          },
          default: "one"
        }, {
          width: 550,
          height: 180,
          resizable: false,
        });
        d.render(true);
        return;
      case "association":
        return randomThing(this.actor, "Associations");
      case "favour":
        return randomFavourOrSight(this.actor);
      case "occupation":
        const occupation = await randomThing(this.actor, "Occupations");
        return this.actor.update({system:{occupation:occupation[0].name}});
      case "focus":
        return randomThing(this.actor, "Foci");
    }
    
  }

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
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    // const itemData = {
    //   name: name,
    //   type: type,
    //   data: data
    // };
    // // // Remove the type from the dataset since it's in the itemData.type prop.
    // delete itemData.data["type"];
    data['type'] = type;
    data['name'] = name;

    // Finally, create the item!
    // return this.actor.createEmbeddedDocuments("Item", [itemData]);
    return this.actor.createEmbeddedDocuments("Item", [data]);
  }

  /**
   * Handle adding a summary description for an Item
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemSummary(event) {
    const empty = `<span class="fa-stack" style="font-size: 0.5em;">
                    <i class="far fa-square fa-stack-2x" style="vertical-align:middle;"></i>
                   </span>`;
    const check = `<span class="fa-stack" style="font-size: 0.5em;">
                      <i class="fas fa-square fa-stack-2x" style="vertical-align:middle;"></i>
                      <i class="fas fa-check fa-stack-1x fa-inverse" style="vertical-align:middle;"></i>
                   </span>`;
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item-entry");
    const item = this.actor.items.get(li.data("item-id"));
    const description = TextEditor.enrichHTML(item.system.description, {async: false});
    const abilities = this.actor.getAbilities();
    let options = "";
    
    if (item.type === "consequence") {
      const resource = game.i18n.localize(`DEE.resource.${item.system.resource}.long`);
      options += `<label>${resource} </label>`;
      options += `<i class="fas fa-caret-down" style="font-size: small;text-align: right;"></i>${Math.abs(item.system.potency)}`;
    }

    if (["association","focus","occupation"].includes(item.type)) {
      item.system.abilities.forEach((i)=> {
        const ability = abilities.filter(e => e.name===i.name);
        const checked = (ability.length > 0) ? check : empty;
        options += `${checked}&nbsp;<label style="font-size: 0.9em;" for="${i.id}" >${i.name}</label>&nbsp;`;
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
   * Handle sheet locking.
   * @param {Event} event   The originating click event
   * @private
   */
   async _onToggleLock(event) {
    const flag = this.actor.getFlag("dee","sheetlock");
    this.actor.setFlag("dee","sheetlock",!flag);
    // $(`#${id}`).fadeOut("medium");
   }

  /**
   * Handle random mannerism.
   * @param {Event} event   The originating click event
   * @private
   */
   async _onGenerate(event) {
    const element = $(event.currentTarget);
    const id = element.attr('id');
    const newData = generator(id);
    await this.actor.update(newData);
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
      const actor = t.actor;
      if (actor.type === "enemy") {
        target = {
          id: actor._id,
          armour: actor.system.resources.armour.value,
        }
        target.potency = actor.system.resistance.potency;
        target.hitresolution = actor.system.hitresolution;
        target.consequences = actor.system.consequences;
      }
      if (target) break;
    }

    if (dataset.roll) {
      switch (resource) {
        case "armour":
          this.actor.rollResistance(resource, dataset.roll);
          break;
        case "unravel":
          this.actor.rollUnravelling(dataset.roll);
          break;
        default:
          this.actor.rollChallenge(resource, dataset.roll, target);
      }
    }
  }
}
