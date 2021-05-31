/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class DeeSanctionItem extends Item {
  // TODO work out how to use Document model in 8.x
  // /** @override */
  // constructor(...args) {
  //   super(...args);
  //   this.abilities = this.abilities || [];
  // }

  // /** @override */
  // static get config() {
  //   return {
  //     baseEntity: Item,
  //     collection: game.items,
  //     embeddedEntities: {
  //       "ActiveEffect": "effects",
  //       "DeeSanctionItem": "abilities"
  //     },
  //     label: "ENTITY.Item",
  //     permissions: {
  //       create: "ITEM_CREATE"
  //     }
  //   };
  // }
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // Get the Item's data
    const itemData = this.data;
    // const actorData = this.actor ? this.actor.data : {};
    // const data = itemData.data;
    if (!itemData.img) {
      switch (itemData.type) {
        case "ability":
          itemData.img = CONFIG.DEE.icons["ability"];
          break;
        case "affliction":
          itemData.img = CONFIG.DEE.icons["affliction"];
          break;
        case "association":
          itemData.img = CONFIG.DEE.icons["conspiracy"];
          break;
        case "favour":
          itemData.img = CONFIG.DEE.icons["favour"];
          break;
        case "focus":
            itemData.img = CONFIG.DEE.icons["access"];
            break;
        case "item":
          itemData.img = (itemData.esoteric) ? CONFIG.DEE.icons["magic"] : CONFIG.DEE.icons["kit"];
          break;
        default:
          itemData.img = CONST.DEFAULT_TOKEN;
          break;
      }
    }
    super.prepareData();
  }
}
