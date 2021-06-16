/**
 * This function is used to hook into the Chat Log context menu to add additional options to each message
 * These options make it easy to conveniently apply damage to controlled tokens based on the value of a Roll
 *
 * @param {HTMLElement} html    The Chat Message being rendered
 * @param {Array} options       The Array of Context Menu options
 *
 * @return {Array}              The extended options Array including new context choices
 */
/* -------------------------------------------- */

export const addChatConsequenceButton = function(msg, html, data) {
  // Hide blind rolls
  let blindable = html.find('.blindable');
  if (msg.data.blind && !game.user.isGM && blindable && blindable.data('blind') === true) {
    blindable.replaceWith("<div class='dice-roll'><div class='dice-result'><div class='dice-formula'>???</div></div></div>");
  }
  // Buttons
  let cb = html.find('.consequence-roll');
  if (cb.data('id')) {
    const id = cb.data('id')
    if (id === "unravel") {
      let label = game.i18n.format('DEE.roll.consequences');
      cb.append($(`<h4>${label}</h4>`));
      let action = "unravelling"
      cb.append($(`<div class="consequence-button"><button type="button" data-action="unravel"><i class="fas fa-dice-d6"></i>${action}</button></div>`));
      cb.find('button[data-action="unravel"]').click((ev) => {
        ev.preventDefault();
        applyChatUnravelRoll();
      });
    } else {
      let label = game.i18n.format('DEE.roll.consequences');
      cb.append($(`<h4>${label}</h4>`));
      let action = "attacking";
      cb.append($(`<h4 class="consequence-button"><button type="button" data-action="consequence" data-attack="true"><i class="fas fa-dice-d6"></i>${action}</button></h4>`));
      label = game.i18n.format('DEE.roll.consequences',{action: "defending"});
      action = "defending";
      cb.append($(`<div class="consequence-button"><button type="button" data-action="consequence" data-attack="false"><i class="fas fa-dice-d6"></i>${action}</button></div>`));
      cb.find('button[data-action="consequence"]').click((ev) => {
        ev.preventDefault();
        const attacking = ev.currentTarget.dataset.attack;
        applyChatConsequenceRoll(id, attacking);
      });
    }
  }
}

/**
 *
 * @param {Number} rollTable    The id of the consequence rolltable
 * @return {Promise}
 */
function applyChatConsequenceRoll(rollTable, attacking=true) {
  return Promise.all(canvas.tokens.controlled.map(t => {
    return t.actor.rollConsequence(rollTable, attacking);
  }));
}

/**
 *
 * @param {Number} rollTable    The id of the consequence rolltable
 * @return {Promise}
 */
 function applyChatUnravelRoll() {
  if (canvas.tokens.controlled.length < 1) {
    return ui.notifications.warn("You must have a token selected first");
  }
  return Promise.all(canvas.tokens.controlled.map((t) => {
    return t.actor.rollUnravellingTable();
  }));
}

/* -------------------------------------------- */
