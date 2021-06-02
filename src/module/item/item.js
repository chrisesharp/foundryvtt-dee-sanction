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

  /** @override */
  static get metadata() {
    const metadata = duplicate(Item.metadata);
    // const metadata = {
    //   name: "DeeSanctionItem",
    //   collection: "items",
    //   embedded: {
    //     "ActiveEffect": Item.metadata.embedded["ActiveEffect"],
    //     "DeeSanctionItem": DeeSanctionItem
    //   },
    //   hasSystemData: true,
    //   isPrimary: false,
    //   label: "DOCUMENT.DeeSanctionItem",
    //   permissions: Item.metadata.permissions,
    //   types: Item.metadata.types
    // }
    // metadata.embedded.push({"Item": DeeSanctionItem});
    // metadata.name = "DeeSanctionItem";
    // metadata.collection = "items";
    // metadata.label = "Document.DeeSanctionItem";
    // metadata.embedded = { "DeeSanctionItem": DeeSanctionItem};
    // console.log("!!!!!!",Item.metadata)
    // console.log("XXXXXX",metadata)
    return metadata;
    // return {
    //   baseEntity: Item,
    //   collection: game.items,
    //   embeddedEntities: {
    //     "ActiveEffect": "effects",
    //     "Item": "abilities"
    //   },
    //   label: "ENTITY.Item",
    //   permissions: {
    //     create: "ITEM_CREATE"
    //   }
    // };
  }

  /** @override*/
  async _preCreate(data, options, user) {
    // console.log("item preCreate called");
    await super._preCreate(data, options, user);

    // const actorData = this.data;

    // if (data.type === "character") {
    //   let skillPack = game.packs.get("zweihander.skills");

    //   let toAdd = await skillPack.getDocuments().then(result => {
    //     return result.map(item => item.toObject());
    //   });

    //   let toAddDifference = UtilityHelpers.getSymmetricDifference(toAdd, actorData.skills);

    //   if (toAddDifference.length)
    //     actorData.update({ "items": toAddDifference });
    // }
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
      this._prepContainer(itemData);
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
    itemData.data.abilities = abilities;
  }
}
