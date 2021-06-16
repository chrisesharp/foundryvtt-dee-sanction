/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class DeeSanctionItem extends Item {
  // TODO work out how to use Document model in 8.x
  /** @override */
  constructor(...args) {
    super(...args);
    // this.abilities = this.abilities || [];
  }

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
    // Get the Item's data
    const itemData = this.data;
    // const actorData = this.actor ? this.actor.data : {};
    // const data = itemData.data;
    switch (itemData.type) {
      case "ability":
        itemData.img = CONFIG.DEE.icons["ability"];
        break;
      case "consequence":
        itemData.img = CONFIG.DEE.icons["consequence"];
        break;
      case "association":
        itemData.img = CONFIG.DEE.icons["conspiracy"];
        // this._prepContainer(itemData);
        break;
      case "occupation":
        itemData.img = CONFIG.DEE.icons["access"];
        // this._prepContainer(itemData);
        break;
      case "favour":
        itemData.img = CONFIG.DEE.icons["favour"];
        break;
      case "focus":
          itemData.img = CONFIG.DEE.icons["vigilance"];
          // this._prepContainer(itemData);
          break;
      case "item":
        itemData.img = (itemData.esoteric) ? CONFIG.DEE.icons["magic"] : CONFIG.DEE.icons["kit"];
        break;
      default:
        itemData.img = CONST.DEFAULT_TOKEN;
        break;
    }
    if (itemData.data.abilities) {
      let abilities = this._prepContainer(itemData);
      itemData.update({data:{abilities:abilities}});
    }
  }

  _prepContainer(itemData) {
    let abilities = deepClone(itemData.data.abilities);
    if (game.items) {
      abilities.forEach(entry => {
        if (!entry._id) {
          let item = game.items.find(i => i.type==="ability" && i.name===entry.name);
          if (item) {
            entry._id = item.data._id;
            entry.img = item.img;
          }
        }
      });
    }
    return abilities;
  }
}
