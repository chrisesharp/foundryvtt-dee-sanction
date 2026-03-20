const fields = foundry.data.fields;

export class ActorDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const schema = {};

        schema.hits = new fields.SchemaField({
            value: new fields.NumberField({ initial: 3, integer: true, min: 0, max: 3, required: true }),
        });

        schema.falters = new fields.SchemaField({
            first: new fields.BooleanField({ initial: false, required: true }),
            second: new fields.BooleanField({ initial: false, required: true }),
        });

        schema.description = new fields.HTMLField();
        return schema;
    }

    static migrateData(source) {
        // Migrate from template.json format to DataModel format
        // Handle hits field migration
        if (source.hits && typeof source.hits.min !== 'undefined') {
            delete source.hits.min;
            delete source.hits.max;
        }
        
        return source;
    }
}