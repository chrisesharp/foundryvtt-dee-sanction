export const registerHandlebarHelpers = async function () {

    Handlebars.registerHelper("gt", function (a, b) {
        return a > b;
    });

    Handlebars.registerHelper("lt", function (a, b) {
        return a < b;
    });

    Handlebars.registerHelper("abs", function (a) {
        return Math.abs(a);
    });

    Handlebars.registerHelper("hasArmour", function (a) {
        return (0 < a && a < 6);
    });

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
        const die = 2 + (2 * dieStep);
        return CONFIG.DEE.icons[`d${die}`];
    });

    Handlebars.registerHelper('checked', function(isChecked) {
        return isChecked ? ' checked ' : '';
    });

    Handlebars.registerHelper('selected', function(isSelected,value) {
        return (isSelected===value) ? ' selected ' : '';
    });

    Handlebars.registerHelper('trade', function(trade) {
        return CONFIG.DEE.icons[trade];
    });


    Handlebars.registerHelper('ability', function(ability) {
        let item = game.items.find(i => i.type==="ability" && i.name===ability);
        return item;
    });

    Handlebars.registerHelper('balance', function(resources) {
        const total = Math.sign(resources.phy.value + resources.int.value + resources.sup.value - 6);
        switch (total) {
            case -1:
                return "fas fa-balance-scale-left";
            case 0:
                return "fas fa-balance-scale";
            case 1:
                return "fas fa-balance-scale-right";   
        }
    });

    Handlebars.registerHelper('balanceTip', function(resources) {
        const total = Math.sign(resources.phy.value + resources.int.value + resources.sup.value - 6);
        switch (total) {
            case -1:
                return "are too low";
            case 0:
                return "balanced";
            case 1:
                return "are too high";   
        }
    });
}
