/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class DeeSanctionItem extends Item {
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
        case "association":
          this._prepareAssociationData(itemData);
          break;
        case "favour":
          itemData.img = CONFIG.DEE.icons["magic"];
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

  _prepareAssociationData(data) {
    data.img = CONFIG.DEE.icons["conspiracy"];
    console.log(data)
  }
}
