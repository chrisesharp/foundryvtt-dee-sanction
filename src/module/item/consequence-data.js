import { BaseItemDataModel } from "./base-data.js";
const fields = foundry.data.fields;

export class ConsequenceDataModel extends BaseItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.resource = new fields.StringField({ initial: "", required: true });
        schema.potency = new fields.NumberField({ initial: -1, integer: true, required: true });
        return schema;
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}