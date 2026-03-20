import { BaseItemDataModel } from "./base-data.js";
const fields = foundry.data.fields;

export class ContainerDataModel extends BaseItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();
        
        schema.abilities = new fields.ArrayField(
            new fields.ObjectField(),
            { initial: [] }
        );
        
        return schema;
    }

    static migrateData(source) {
        // Call parent migration first
        super.migrateData(source);
        
        // Migrate from old container.abilities structure to new abilities structure
        if (source.container?.abilities) {
            source.abilities = source.container.abilities;
            delete source.container;
        }
        
        return source;
    }
}