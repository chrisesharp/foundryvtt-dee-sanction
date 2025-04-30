import { DeeSanctionPartySheet } from "./dialog/party-sheet.js";

export const addControl = (object, html) => {
    let control = `<button class='dee-party-sheet' type="button" title='${game.i18n.localize('DEE.dialog.partysheet')}'><i class='fas fa-users'></i></button>`;
    html.querySelector('.directory-header').innerHTML += control;
    html.querySelector('.dee-party-sheet').addEventListener('click', (ev) => {
        showPartySheet(object);
    })
}

export const showPartySheet = (object) => {
    new DeeSanctionPartySheet(object, {
      top: window.screen.height / 2 - 180,
      left:window.screen.width / 2 - 140,
    }).render(true);
}

export const update = (actor, data) => {
    if (actor.getFlag('dee', 'party')) {
        Object.values(ui.windows).forEach(w => {
            if (w instanceof DeeSanctionPartySheet) {
                w.render(true);
            }
        })
    }
}