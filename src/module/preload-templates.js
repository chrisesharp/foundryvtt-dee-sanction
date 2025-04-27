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
        'systems/dee/templates/actor/partials/enemy-abilities.html',
        'systems/dee/templates/actor/partials/enemy-header.html',
        'systems/dee/templates/actor/partials/enemy-resistance.html',
        'systems/dee/templates/actor/partials/enemy-resolution.html',
        'systems/dee/templates/actor/partials/actor-effects.hbs',
        // Item Partials
        'systems/dee/templates/item/partials/item-abilities-list.html',
        'systems/dee/templates/item/partials/item-effects.html',
        // Dialog Partials
        'systems/dee/templates/dialog/partials/party-sheet-header.html',
        'systems/dee/templates/dialog/partials/party-sheet-summary.html',
        'systems/dee/templates/dialog/partials/party-sheet-abilities.html',
        'systems/dee/templates/dialog/partials/party-sheet-possessions.html'
    ];
    return loadTemplates(templatePaths);
};
