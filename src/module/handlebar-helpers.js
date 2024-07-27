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

    Handlebars.registerHelper("player", function (id) {
        const player = game.users.players.find(p=>p.character?.id===id);
        return (player) ? player.name: "";
    });

    Handlebars.registerHelper("hasArmour", function (a) {
        return (0 < a && a < 6);
    });

    Handlebars.registerHelper("unlocked", function (actor) {
        return actor.getFlag("dee","sheetlock");
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

    Handlebars.registerHelper('isChecked', function(isChecked) {
        return isChecked ? ' checked ' : '';
    });

    Handlebars.registerHelper('isSelected', function(isSelected,value) {
        return (isSelected===value) ? ' selected ' : '';
    });

    Handlebars.registerHelper('trade', function(trade) {
        return CONFIG.DEE.icons[trade];
    });

    Handlebars.registerHelper('inParty', function(actor) {
        return actor.getFlag('dee','party');
    });

    Handlebars.registerHelper('possIcon', function(i) {
        if (i.endsWith('*')) {
            const text = i.substr(0, i.length - 1);
            return new Handlebars.SafeString(`<span title="${game.i18n.localize('DEE.tabs.esoterica')}">${text}<img src="systems/dee/assets/default/icons/magic.png" width="10px"></span>`);
        }
        return i;
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

    Handlebars.registerHelper('contains', function(e, arr) {
        return arr.includes(e);
    });

    Handlebars.registerHelper('insertLink', function (item) {
        return TextEditor.enrichHTML(item.id, {async: false});
    });
}
