import { BaseItemDataModel } from "./base-data.js";
const fields = foundry.data.fields;

export class ItemDataModel extends BaseItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.quantity = new fields.NumberField({ initial: 1, integer: true, min: 1, required: true });
        schema.weight = new fields.NumberField({ initial: 0, integer: true, min: 0, required: true });
        schema.esoteric = new fields.BooleanField({ initial: false, required: true });
        return schema;
    }

    static migrateData(source) {
        // Call parent migration
        super.migrateData(source);
        // No specific migrations needed for item fields
        return source;
    }
}