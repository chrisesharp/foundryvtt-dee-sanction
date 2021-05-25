import {DeeSanctionActorSheet} from "./actor-sheet.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {DeeSanctionActorSheet}
 */
export class DeeSanctionEnemySheet extends DeeSanctionActorSheet {
    constructor(...args) {
        super(...args);
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ["dee", "sheet", "actor", "enemy"],
        template: "systems/dee/templates/actor/enemy-sheet.html",
        width: 400,
        height: 575,
        tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "resistance" }]
        });
    }
}