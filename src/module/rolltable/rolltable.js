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
      let result = Promise.all([black,yellow,blood,phlegm,unravel].map(t=>t.fixUpNestedTables()))
      return await result.then(unravel.draw());
  }

  async fixUpNestedTables() {
    const tableData = this.data;
    let results = await tableData.results.contents.filter(t=>t.data.type==1);
    if (results && results.length > 0) {
      return Promise.all(results.map(tr => {
        return this._prepTableData(tr);
      }));
    }
    
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
        data.resultId = result.id
        return tableResult.update({data:data});
      }
    }
    return Promise.resolve();
  }
}
