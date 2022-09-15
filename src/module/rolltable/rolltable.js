import { Logger } from "../logger.js";

const log = new Logger();

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {RollTable}
 */
export class DeeSanctionRollTable extends RollTable {

  static async drawUnravelling() {
      let black = game.tables.getName("Humour:Black Bile")
      let yellow = game.tables.getName("Humour:Yellow Bile")
      let blood = game.tables.getName("Humour:Blood")
      let phlegm = game.tables.getName("Humour:Phlegm")
      let unravel = game.tables.getName("Unravelling")
      let result = Promise.all([black,yellow,blood,phlegm,unravel].map(t=>t._fixNestedTables()))
      return await result.then(unravel.draw());
  }

  async _fixNestedTables() {
    let updates = [];
    this.results.contents.forEach(async (t, i) => {
      if (t.type==1) {
        let update = await this._prepTableData(t);
        try {
          updates.push({_id:t.id, update})
        } catch (e) {
          log.error("failed to add update:",t.id, update);
        }
      }
    });
    return Promise.resolve();
  }

  _prepTableData(tableResult) {
    let data = foundry.utils.deepClone(tableResult);
    if ((!data.resultId || data.resultId==="")) {
      let result;
      if (data.text.includes("Humour:")) {
        result = game.tables.getName(tableResult.text);
      } else {
        result = game.items.getName(tableResult.text);
      }
      if (result?.id) {
        try {
          data.resultId = result.id
          return tableResult.update({_id:tableResult.id, data});
        } catch (e) {
          log.error("failed to update:",result.id, data);
        }
      }
    }
    return Promise.resolve(tableResult);
  }
}
