import { ActorDataModel } from "./actor-data.js";
const fields = foundry.data.fields;

export class AgentDataModel extends ActorDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.occupation = new fields.StringField({ initial: "", required: true });
        schema.home = new fields.StringField({ initial: "", required: true });
        schema.tradecraft = new fields.StringField({ initial: "", required: true });
        schema.mannerism = new fields.SchemaField({
            humour: new fields.StringField({ initial: "", required: true }),
            detail: new fields.StringField({ initial: "", required: true }),
        });
        schema.fortune = new fields.NumberField({ initial: 1, integer: true, min: 0, required: true });
        schema.resources = new fields.SchemaField({
            int: new fields.SchemaField({
                value: new fields.NumberField({ initial: 2, integer: true, min: 0, max: 5, required: true }),
            }),
            phy: new fields.SchemaField({
                value: new fields.NumberField({ initial: 2, integer: true, min: 0, max: 5, required: true }),
            }),
            sup: new fields.SchemaField({
                value: new fields.NumberField({ initial: 2, integer: true, min: 0, max: 5, required: true }),
            }),
            armour: new fields.SchemaField({
                value: new fields.NumberField({ initial: 6, integer: true, min: 0, max: 6, required: true }),
            }),
            unravel: new fields.SchemaField({
                value: new fields.NumberField({ initial: 3, integer: true, min: 0, max: 5, required: true }),
            }),
        });

        schema.contacts = new fields.ArrayField(new fields.ObjectField(), { initial: [] });
        return schema;
    }

    static migrateData(source) {
        // Call parent migration first
        super.migrateData(source);
        
        // Migrate resources - remove min/max from nested fields
        if (source.resources) {
            ['int', 'phy', 'sup', 'armour', 'unravel'].forEach(key => {
                if (source.resources[key]) {
                    delete source.resources[key].min;
                    delete source.resources[key].max;
                }
            });
        }
        
        return source;
    }
}