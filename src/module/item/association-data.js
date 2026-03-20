import { ContainerDataModel } from "./container-data.js";
const fields = foundry.data.fields;

export class AssociationDataModel extends ContainerDataModel {
    static defineSchema() {
        return super.defineSchema();
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}