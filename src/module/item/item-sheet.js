const { ItemSheetV2 } = foundry.applications.sheets;
const { DragDrop, TextEditor } = foundry.applications.ux;
const { HandlebarsApplicationMixin } = foundry.applications.api;
import { prepareActiveEffectCategories, createConsequenceEffect} from "../effects.js";

export class DeeSanctionItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

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
    classes: ['dee', 'sheet', 'item'],
    position: {
      width: 350,
      height: 375,
    },
    actions: {
      onEditImage: this._onEditImage,
      itemEdit: this._itemEdit,
      itemDelete: this._onAbilityDelete,
      createDoc: this._createDoc,
      toggleEffect: this._effectToggle,
      editEffect: this._effectEdit,
      deleteEffect: this._effectDelete,
      selectConsequence: this._selectConsequence,
      selectPotency: this._onPotencyChange,
    },
    window: {
      resizable: false,
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  }

  static PARTS = {
    header: {
      template: 'systems/dee/templates/item/partials/item-sheet-header.hbs',
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

  _getTabs(parts) {
    const tabGroup = 'primary';
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'notes';
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

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ['header', 'tabs', 'notes'];
    if (this.document.limited) return;
    if (game.settings?.get('dee', 'effects-tab') && game.user.isGM) {
      options.parts.push('effects');
    }
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

  _canDragStart(_selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(_selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(_event) {}

  /** @override */
  async _onDragStart(event) {
    const div = event.currentTarget;
    // Create drag data
    const dragData = {};
    const itemId = div.dataset.itemId;
    // Owned Items
    if (itemId) {
      let item = game.items?.get(itemId);
      if (!item) {
        const pack = game.packs.get('dee.abilities');
        item = ((await pack?.getDocument(itemId))) ?? undefined;
      }
      dragData['type'] = 'Item';
      dragData['data'] = item?.data;
    }
    if (Object.keys(dragData).length === 0) return;
    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  onDropAllow(_actor, data) {
    return data.type === 'Item';
  }

  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call('dropItemSheetData', item, this, data);
    if (!allowed) return;

    // Handle different data types
    switch (data.type) {
      case 'Item':
        return this._onDropItem(event, data);
      case "ActiveEffect": 
        return this._onDropActiveEffect(data);
      default:
        return;
    }
  }

  get dragDrop() {
    return this.#dragDrop;
  }

  async _onDropItem(event, data) {
    if (!this.isEditable) return false;
    let abilities = this.item.system.abilities.filter(a=>a.uuid != data.uuid);
    let ability = await fromUuid(data['uuid']);
    if (!ability) {
      const pack = game.packs.get("dee.abilities");
      ability = await pack?.getDocument(data['uuid']);
    }
    if (ability) {
      abilities.push({name: ability.name, type: "ability", img: ability.img, id: ability.id});
      const newAbilities = { system:
        {
          abilities: abilities
        }
      }
      return this.item.update(newAbilities);
    } else {
      return false;
    }
  }
  
  async _onDropActiveEffect(data) {
    if (!this.isEditable) return false;
    const item = this.item;
    if ( !data.data ) return;
    return ActiveEffect.create(data.data, {parent: item})
  }

  _onRender(_context, _options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  /** @override */
  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    if (this.item.type === "consequence") {
      if (!this.item.transferredEffects.length) {
        await createConsequenceEffect("phy",-1,this.item);
      }
    }
    data.item = this.item;
    data.config = CONFIG.DEE;
    data.data = this.item.system;
    data.user = game.user;
    data.effects = prepareActiveEffectCategories(this.item.effects);
    data.tabs = this._getTabs(options.parts);
    return data;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'notes':
        context.tab = context.tabs[partId];
        context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description, {
          secrets: this.document.isOwner,
          rollData: this.item.getRollData(),
          // Relative UUID resolution
          relativeTo: this.item,
        });
        break;
      case 'effects':
        context.tab = context.tabs[partId];
        break;
      default:
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }

  static _itemEdit(_event, element) {
    const li = element.parentNode.parentNode;
    const item = game.items.get(li.dataset.itemId);
    item?.sheet?.render(true);
  }

  static async _selectConsequence(event, target) {
      event.preventDefault();
      // const resource = $('#consequence-sel').val();
      const resource = target.value;
      const newData = {resource:resource};
      for ( let e of this.item.effects ) {
        let name = await e.sourceName; // Trigger a lookup for the source name
        if (name === this.item.name) {
          const change = foundry.utils.duplicate(e.data.changes[0]);
          change.key = `resources.${resource}.value`;
          e.update({changes: [change]});
          break;
        }
      }
      await this.item.update(newData);
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

  /**
   * Handle deleting an ability Item
   * @param {String} id   the id of the ability
   * @private
   */
  static async _onAbilityDelete(_event, target) {
    const id = target.closest('.item-controls').dataset.itemId;
    const abilities = this.item.system.abilities.filter((i)=>i.id != id);
    const newAbilities = { system:
      {
        abilities: abilities
      }
    }
    return await this.item.update(newAbilities);
  }

  static async _onPotencyChange(event, target) {
    event.preventDefault();
    const potency = target.value;
    const newData = {potency:potency};
    for ( let e of this.item.effects ) {
      let name = await e.name; // Trigger a lookup for the source name
      if (name === this.item.name) {
        const change = foundry.utils.duplicate(e.changes[0]);
        change.value = parseInt(potency);
        change.mode =  2;
        e.update({changes: [change]});
        break;
      }
    }
    await this.item.update(newData);
  }

  _getEffect(target) {
    const li = target.closest('.effect');
    return this.item.effects.get(li?.dataset?.effectId);
  }

  static async _effectToggle(_event, target) {
    const effect = this._getEffect(target);
    await effect.update({ disabled: !effect.disabled });
  }

  static async _effectEdit(_event, target) {
    const effect = this._getEffect(target);
    await effect?.sheet.render(true);
  }

  static async _effectDelete(_event, target) {
    const effect = this._getEffect(target);
    await effect.delete();
  }
}
