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
    const tableData = this.data;
    let updates = [];
    tableData.results.contents.forEach(async (t, i) => {
      if (t.data.type==1) {
        let update = await this._prepTableData(t);
        try {
          updates.push({_id:t.id, data:update})
        } catch (e) {
          console.log("failed to add update:",t.id, update);
        }
      }
    });
    return Promise.resolve();
    // return this.updateEmbeddedDocuments("TableResult",updates)
  }

  _prepTableData(tableResult) {
    let data = foundry.utils.deepClone(tableResult.data);
    if ((!data.resultId || data.resultId==="")) {
      let result;
      if (data.text.includes("Humour:")) {
        result = game.tables.getName(tableResult.data.text);
      } else {
        result = game.items.getName(tableResult.data.text);
      }
      if (result?.id) {
        try {
          data.resultId = result.id
          return tableResult.update({_id:tableResult.id, data:data});
        } catch (e) {
          console.log("failed to update:",result.id, data);
        }
        
      }
    }
    return Promise.resolve(tableResult);
  }
}
