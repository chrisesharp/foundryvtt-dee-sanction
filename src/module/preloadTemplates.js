export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        // Actor Sheets
        'systems/dee/templates/actor/agent-sheet.html',
        // Actor Partials
        'systems/dee/templates/actor/partials/actor-header.html',
        'systems/dee/templates/actor/partials/actor-resources.html',
        'systems/dee/templates/actor/partials/actor-abilities.html',
        'systems/dee/templates/actor/partials/actor-possessions.html',
        'systems/dee/templates/actor/partials/actor-affiliations.html',
        'systems/dee/templates/actor/partials/actor-esoterica.html',
    ];
    return loadTemplates(templatePaths);
};
