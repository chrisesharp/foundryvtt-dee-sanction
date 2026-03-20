import { ActorDataModel } from "./actor-data.js";
const fields = foundry.data.fields;

export class EnemyDataModel extends ActorDataModel {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.resources = new fields.SchemaField({
            armour: new fields.SchemaField({
                value: new fields.NumberField({ initial: 6, integer: true, min: 0, max: 6, required: true }),
            }),
        });

        schema.resistance = new fields.SchemaField({
            potency: new fields.NumberField({ initial: 0, integer: true, required: true }),
            mark: new fields.SchemaField({
                S: new fields.BooleanField({ initial: false, required: true }),
                K: new fields.BooleanField({ initial: false, required: true }),
                V: new fields.BooleanField({ initial: false, required: true }),
                M: new fields.BooleanField({ initial: false, required: true }),
                A: new fields.BooleanField({ initial: false, required: true }),
                C: new fields.BooleanField({ initial: false, required: true }),
            }),
        });

        schema.hitresolution = new fields.SchemaField({
            rolltable: new fields.SchemaField({
                id: new fields.StringField({ initial: "", required: true }),
                name: new fields.StringField({ initial: "", required: true }),
                img: new fields.StringField({ initial: "", required: true }),
            }),
        });
        return schema;
    }

    static migrateData(source) {
        // Call parent migration first
        super.migrateData(source);
        
        // Migrate resources - remove min/max from armour
        if (source.resources?.armour) {
            delete source.resources.armour.min;
            delete source.resources.armour.max;
        }
        
        return source;
    }
}