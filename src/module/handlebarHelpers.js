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

}
