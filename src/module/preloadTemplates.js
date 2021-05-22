export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        // Actor Sheets
        'systems/dee/templates/actor/agent-sheet.html',
        // Actor Partials
        'systems/dee/templates/actor/partials/actor-header.html',
        'systems/dee/templates/actor/partials/actor-resources.html',
        'systems/dee/templates/actor/partials/actor-abilities.html',
        'systems/dee/templates/actor/partials/actor-possessions.html',
    ];
    return loadTemplates(templatePaths);
};
