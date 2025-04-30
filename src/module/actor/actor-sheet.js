import { prepareActiveEffectCategories} from "../effects.js";
import { generator, randomFavourOrSight, randomPossessions, randomThing } from "../generator.js";
import { findHitResolutionTable } from "./actor.js";
const { ActorSheetV2 } = foundry.applications.sheets;
const { DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;
const { DragDrop, TextEditor } = foundry.applications.ux;
import { slideToggle } from '../utils/slide.js';
const { renderTemplate } = foundry.applications.handlebars;
const { FilePicker } = foundry.applications.apps;


export class DeeSanctionActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  #dragDrop;
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }
  
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    });
  }
  
  static DEFAULT_OPTIONS = {
    classes: ['dee', 'sheet', 'actor'],
    position: {
      width: 450,
      height: 530,
    },
    actions: {
      onEditImage: this._onEditImage,
      itemSummary: this._onItemSummary,
      roll: this._onRoll,
      itemEdit: this._itemEdit,
      itemDelete: this._itemDelete,
      createDoc: this._createDoc,
      padlock: this._onToggleLock,
      generate: this._onGenerate,
      itemRand: this._onRandomPossession,
      tradecraft: this._onTradecraft,
      stepUp: this.stepUp,
      stepDown: this.stepDown,
    },
    window: {
      resizable: true,
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/dee/templates/actor/partials/agent-header.hbs',
    },
    tabs: {
      template: 'systems/dee/templates/actor/partials/agent-nav.hbs',
    },
    resources: {
      template: 'systems/dee/templates/actor/partials/actor-resources.hbs',
    },
    abilities: {
      template: 'systems/dee/templates/actor/partials/actor-abilities.hbs',
    },
    possessions: {
      template: 'systems/dee/templates/actor/partials/actor-possessions.hbs',
    },
    associations: {
      template: 'systems/dee/templates/actor/partials/actor-associations.hbs',
    },
    esoterica: {
      template: 'systems/dee/templates/actor/partials/actor-esoterica.hbs',
    },
    effects: {
      template: 'systems/dee/templates/actor/partials/actor-effects.hbs',
    },
    notes: {
      template: 'systems/dee/templates/actor/partials/actor-notes.hbs',
    }
  };

  async _prepareContext(options) {
    const baseData = {
      options: options,
      owner: this.actor.isOwner,
      user: game.user,
      actor: this.actor,
      editable: this.actor.sheet.isEditable,
      config: CONFIG.DEE,
      data: this.actor.system,
      tabs: this._getTabs(options.parts),
      effects:  prepareActiveEffectCategories(this.actor.effects),
    }
    return await this._prepareItems(baseData);
  }

  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'resources';
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

  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'resolution':
      case 'notes':
        context.tab = context.tabs[partId];
        context.enrichedDescription = await TextEditor.enrichHTML(this.actor.system.description, {
          secrets: this.document.isOwner,
          rollData: this.actor.getRollData(),
          // Relative UUID resolution
          relativeTo: this.actor,
        });
        break;
      default:
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }

  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    if (item && item.type==="occupation") {
      await this.actor.update({system:{occupation:item.name}});
    }
    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  async _onDropItemCreate(itemData, _event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', itemData);
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  async _prepareItems(data) {
    if (data.actor.type==="enemy") {
      if (data.data.hitresolution?.rolltable?.uuid === "") {
        const hitresolution = findHitResolutionTable(data.data.hitresolution);
        data.data.hitresolution = hitresolution;
        await data.actor.update({system:{hitresolution: hitresolution}});
      }
    }
    return data;
  }

  static _itemEdit(_event, element) {
    const li = element.parentNode.parentNode;
    const item = this.actor.items.get(li.dataset.itemId);
    item?.sheet?.render(true);
  }

  static async _itemDelete(_event, element) {
    const li = element.parentNode.parentNode;
    const itemID = li.dataset.itemId;
    const item = this.actor.items.get(itemID);
    await item.delete();
  }

  static async _onEditImage(_event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {};
    const fp = new FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  static async _createDoc(event, target) {
    // Retrieve the configured document class for Item or ActiveEffect
    const docCls = getDocumentClass(target.dataset.documentClass);
    // Prepare the document creation data by initializing it a default name.
    const docData = {
      name: docCls.defaultName({
        // defaultName handles an undefined type gracefully
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // These data attributes are reserved for the action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      // Nested properties require dot notation in the HTML, e.g. anything with `system`
      // An example exists in spells.hbs, with `data-system.spell-level`
      // which turns into the dataKey 'system.spellLevel'
      foundry.utils.setProperty(docData, dataKey, value);
    }

    // Finally, create the embedded document!
    await docCls.create(docData, { parent: this.actor });
  }

  _onRender(_context, _options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  static async stepUp(event, target) {
    event.preventDefault();
    const resource = target.parentElement.dataset.resource;
    await this.updateResource(resource, 1);
  }

  static async stepDown(event, target) {
    event.preventDefault();
    const resource = target.parentElement.dataset.resource;
    await this.updateResource(resource, -1);
  }

  static async _onTradecraft(event, target) {
    event.preventDefault();
    const opt = target.querySelector('#tradecraft-sel').value;
    if (opt !== '0') {
      const trade = CONFIG.DEE.tradecraft[opt]; 
      const newData = {tradecraft:trade};
      await this.actor.update({system:newData});
    }
  }
  /**
   * Handle updating an actor's resource
   * @param {String} resource   The name of the resource
   * @param {Number} delta  The amount (positive or negative) to adjust the resource by
   * @private
   */
  async updateResource(resource, delta) {
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
  static async _onRandomPossession(event, target) {
    event.preventDefault();
    const targetType = target.dataset.type;
    switch (targetType) {
      case "item":
        const template = "systems/dee/templates/dialog/possessions-dialog.hbs";
        const content = await renderTemplate(template);
    
        let d = new DialogV2({
              classes: ['dee'],
              window: {
                title: "Randomly choose possessions",
                resizable: false,
                width: 550,
                height: 180,
              },
              content: content,
              buttons: [
                {
                  action: 'one',
                  icon: 'fas fa-check',
                  label: "Randomly Roll for Possessions",
                  callback: (html) => { 
                    randomPossessions(this.actor, html); 
                  }
                }
              ],
              default: "one"
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

  static async _onItemSummary(event, target) {
    const empty = `<span class="fa-stack" style="font-size: 0.5em;">
                    <i class="far fa-square fa-stack-2x" style="vertical-align:middle;"></i>
                   </span>`;
    const check = `<span class="fa-stack" style="font-size: 0.5em;">
                      <i class="fas fa-square fa-stack-2x" style="vertical-align:middle;"></i>
                      <i class="fas fa-check fa-stack-1x fa-inverse" style="vertical-align:middle;"></i>
                   </span>`;
    event.preventDefault();
    const entry = target.parentNode.parentNode;
    const itemId = entry.dataset.itemId;
    const li = entry;
    const item = await this.actor.items.get(itemId);
    if (item) {
      const description = await TextEditor.enrichHTML(item.system.description, {async: true});
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
      if (!li.querySelector('.item-summary')) {
        const section = `<div class="item-summary" style="display:none;">
            <div>
              ${description}
            </div>
            ${options}
          </div>`;
        li.innerHTML += section;
      }
      // Toggle summary
      slideToggle(li.querySelector('.item-summary'));
    }
  }


  /**
   * Handle sheet locking.
   * @param {Event} event   The originating click event
   * @private
   */
  static async _onToggleLock(_event, _target) {
    const flag = this.actor.getFlag("dee","sheetlock");
    this.actor.setFlag("dee","sheetlock",!flag);
   }

  /**
   * Handle random mannerism.
   * @param {Event} event   The originating click event
   * @private
   */
  static async _onGenerate(_event, target) {
    const element = target;
    const id = element.getAttribute('id');
    const newData = generator(id);
    await this.actor.update(newData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  static async _onRoll(event, target) {
    event.preventDefault();
    const element = target;
    const resource = element.dataset.resource;
    const dataset = element.dataset;
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
