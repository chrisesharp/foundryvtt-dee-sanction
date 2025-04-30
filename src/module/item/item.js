import { Logger } from "../logger.js";

const log = new Logger();
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class DeeSanctionItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  async prepareData() {
    await super.prepareData();
    // Get the Item's data
    const itemData = this.system;
    switch (this.type) {
      case "ability":
        itemData.img = CONFIG.DEE.icons["ability"];
        break;
      case "consequence":
        itemData.img = CONFIG.DEE.icons["consequence"];
        break;
      case "association":
        itemData.img = CONFIG.DEE.icons["conspiracy"];
        break;
      case "occupation":
        itemData.img = CONFIG.DEE.icons["access"];
        break;
      case "favour":
        itemData.img = CONFIG.DEE.icons["favour"];
        break;
      case "focus":
        itemData.img = CONFIG.DEE.icons["vigilance"];
          break;
      case "item":
        itemData.img = (itemData.esoteric) ? CONFIG.DEE.icons["magic"] : CONFIG.DEE.icons["kit"];
        break;
      default:
        itemData.img = CONST.DEFAULT_TOKEN;
        break;
    }

    if (itemData.abilities) {
      itemData.abilities = this._prepContainer(itemData);
    }

    if (itemData.effects) {
      itemData.effects.forEach(async (e) => {
        try {
            e.origin = this.uuid;
        } catch (e) { log.error(e); }
      });
    }
  }

  /* @override */
  async update(data, operation) {
    if (this.type === 'consequence' && (data.system?.resource || data.system?.potency) ) {
      const resource = data.system?.resource;
      const potency = data.system?.potency;
      for ( let e of this.effects ) {
        let name = await e.sourceName; // Trigger a lookup for the source name
        if (name === this.name) {
          const change = foundry.utils.duplicate(e.changes[0]);
          if (resource) {
            change.key = `resources.${resource}.value`;
          }
          if (potency) {
            change.value = parseInt(potency);
            change.mode =  2;
          }
          await e.update({changes: [change]});
          break;
        }
      }
    }
    return super.update(data, operation);
  }

  _prepContainer(itemData) {
    const abilities = foundry.utils.deepClone(itemData.abilities);
    if (game.items) {
      abilities.filter(e=>!e.id).forEach(entry => {
        if (!entry.id) {
          const item = game.items.find(i => i.type==="ability" && i.name===entry.name);
          if (item) {
            entry.id = item.id;
            entry.img = item.img;
          }
        }
      });
    }
    return abilities;
  }
}
