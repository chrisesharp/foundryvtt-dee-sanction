export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        // Actor Sheets
        'systems/dee/templates/actor/actor-sheet.html',
        // Actor Partials
        'systems/dee/templates/actor/partials/actor-header.html',
        'systems/dee/templates/actor/partials/actor-resources.html',
    ];
    return loadTemplates(templatePaths);
};
