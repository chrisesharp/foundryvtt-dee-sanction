export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        // Actor Sheets
        'systems/dee/templates/actor/agent-sheet.html',
        'systems/dee/templates/actor/enemy-sheet.html',
        // Actor Partials
        'systems/dee/templates/actor/partials/actor-header.html',
        'systems/dee/templates/actor/partials/actor-resources.html',
        'systems/dee/templates/actor/partials/actor-abilities.html',
        'systems/dee/templates/actor/partials/actor-possessions.html',
        'systems/dee/templates/actor/partials/actor-affiliations.html',
        'systems/dee/templates/actor/partials/actor-esoterica.html',
        'systems/dee/templates/actor/partials/enemy-abilities.html',
        'systems/dee/templates/actor/partials/enemy-header.html',
        'systems/dee/templates/actor/partials/enemy-resistance.html',
        'systems/dee/templates/actor/partials/enemy-resolution.html',
        'systems/dee/templates/actor/partials/actor-effects.html',
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
