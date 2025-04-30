const { loadTemplates } = foundry.applications.handlebars;
export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        // Actor Partials
        'systems/dee/templates/actor/partials/agent-header.hbs',
        'systems/dee/templates/actor/partials/agent-nav.hbs',
        'systems/dee/templates/actor/partials/actor-resources.hbs',
        'systems/dee/templates/actor/partials/actor-abilities.hbs',
        'systems/dee/templates/actor/partials/actor-possessions.hbs',
        'systems/dee/templates/actor/partials/actor-associations.hbs',
        'systems/dee/templates/actor/partials/actor-esoterica.hbs',
        'systems/dee/templates/actor/partials/actor-notes.hbs',
        'systems/dee/templates/actor/partials/enemy-abilities.hbs',
        'systems/dee/templates/actor/partials/enemy-header.hbs',
        'systems/dee/templates/actor/partials/enemy-resistance.hbs',
        'systems/dee/templates/actor/partials/enemy-resolution.hbs',
        'systems/dee/templates/actor/partials/actor-effects.hbs',
        // Item Partials
        'systems/dee/templates/item/partials/item-sheet-generic-header.hbs',
        'systems/dee/templates/item/partials/item-sheet-effects.hbs',
        // Dialog Partials
        'systems/dee/templates/dialog/partials/party-sheet-header.hbs',
        'systems/dee/templates/dialog/partials/party-sheet-nav.hbs',
        'systems/dee/templates/dialog/partials/party-sheet-summary.hbs',
        'systems/dee/templates/dialog/partials/party-sheet-abilities.hbs',
        'systems/dee/templates/dialog/partials/party-sheet-possessions.hbs'
    ];
    return loadTemplates(templatePaths);
};
