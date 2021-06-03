/**
 * Extend the basic Item with some very simple modifications.
 * @extends {RollTable}
 */
export class DeeSanctionRollTable extends RollTable {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
    // Get the Item's data
    const tableData = this.data;
    let results = tableData.results.contents.filter(t=>t.data.type==1);
    if (results) {
      this._prepTableData(results);
    }
  }

  _prepTableData(tableData) {
    tableData.forEach(table => {
      if (!table.data.resultId) {
        let result = game.tables.getName(table.data.text);
        table.data.resultId = result.id;
      }
    });
  }
}
