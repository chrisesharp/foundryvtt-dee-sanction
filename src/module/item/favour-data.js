import { BaseItemDataModel } from "./base-data.js";
const fields = foundry.data.fields;

export class FavourDataModel extends BaseItemDataModel {
    static defineSchema() {
        return super.defineSchema();
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}