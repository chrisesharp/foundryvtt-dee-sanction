export const registerHandlebarHelpers = async function () {

    Handlebars.registerHelper('concat', function() {
        var outStr = '';
        for (var arg in arguments) {
            if (typeof arguments[arg] != 'object') {
            outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper('toLowerCase', function(str) {
        return str.toLowerCase();
    });

    Handlebars.registerHelper('die', function(dieStep) {
        const die = 2+ (2 * dieStep);
        return CONFIG.DEE.icons[`d${die}`];
    });

    Handlebars.registerHelper('checked', function(isChecked) {
        return isChecked ? ' checked ' : '';
    });

    Handlebars.registerHelper('trade', function(trade) {
        return CONFIG.DEE.icons[trade];
    });
}
