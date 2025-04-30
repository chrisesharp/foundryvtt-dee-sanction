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
  let blindable = html.querySelector('.blindable');
  if (msg.blind && !game.user.isGM && blindable && blindable.dataset.blind === true) {
    blindable.replaceWith("<div class='dice-roll'><div class='dice-result'><div class='dice-formula'>???</div></div></div>");
  }
  // Buttons
  const cb = html.querySelector('.consequence-roll');
  if (cb?.dataset.id) {
    switch (cb.dataset.id) {
      case "unravel":
        _addUnravelButton(cb);
        break;
      case "chance":
        _addChanceMessage(cb);
        break;
      default:
        _addConsequenceButtons(cb);
        break;
    }
  }
}

function _addUnravelButton(cb) {
  const actorId = cb.dataset.actorId;
  const label = game.i18n.format('DEE.roll.consequences');
  cb.innerHTML+=`<h4>${label}</h4>`;
  const action = "unravelling";
  cb.innerHTML+=`<div class="consequence-button"><button type="button" data-action="unravel" data-actor="${actorId}"><i class="fas fa-dice-d6"></i>${action}</button></div>`;
  cb.querySelector('button[data-action="unravel"]').addEventListener('click', (ev) => {
    ev.preventDefault();
    const actor = ev.currentTarget.dataset.actor;
    ev.currentTarget.disabled=true;
    applyChatUnravelRoll(actor);
  });
}

function _addChanceMessage(cb) {
  const actorId = cb.dataset.actorId;
  const actor = game.actors.get(actorId);
  if (actor && actor.system.hits.value === 0) {
    const falters = actor.system.falters;
    const numFalters = (falters.first === true) + (falters.second === true);
    let label
    switch (numFalters) {
      case 0:
        label = game.i18n.format('DEE.chance.first',{actor: actor.name});
        break;
      case 1:
        label = game.i18n.format('DEE.chance.second',{actor: actor.name});
        break;
      case 2:
        label = game.i18n.format('DEE.chance.dead',{actor: actor.name});
        cb.innerHTML+=`<img src="systems/dee/assets/default/icons/bones.png" width="40" height="40" style="border:0px;" >`;
        break;
    }
    cb.innerHTML+=`<h2 style="font-size: 1.2em">${label}</h2>`;
  }
}

function _addConsequenceButtons(cb) {
  const id = cb.dataset.id;
  let label = game.i18n.format('DEE.roll.consequences');
  cb.innerHTML+=`<h4>${label}</h4>`;
  let action = "attacking";
  cb.innerHTML+=`<div class="consequence-button"><button id="attack" type="button" data-action="consequence" data-attack="true"><i class="fas fa-dice-d6"></i>${action}</button></div>`;
  label = game.i18n.format('DEE.roll.consequences',{action: "defending"});
  action = "defending";
  cb.innerHTML+=`<div class="consequence-button"><button id="defend" type="button" data-action="consequence" data-attack="false"><i class="fas fa-dice-d6"></i>${action}</button></div>`;
  cb.querySelectorAll('button[data-action="consequence"]').forEach((e) => {
    e.addEventListener('click', (ev) => {
      ev.preventDefault();
      const chosen = ev.currentTarget;
      const attacking = chosen.dataset.attack;
      const otherId = (attacking==="true") ? "defend" : "attack";
      const otherButton = chosen.closest('.consequence-roll').querySelector(`#${otherId}`);
      otherButton.remove();
      chosen.disabled=true;
      applyChatConsequenceRoll(id, attacking);
    });
  });
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
 * @param {Number} actorId    The id of the actor checking for unravel
 * @return {Promise}
 */
 function applyChatUnravelRoll(actorId) {
  if (actorId) {
    const actor = game.actors.get(actorId);
    if (actor) {
      return actor.rollUnravellingTable();
    }
  }
  if (canvas.tokens.controlled.length < 1) {
    return ui.notifications.warn("You must have a token selected first");
  } else {
    return Promise.all(canvas.tokens.controlled.map((t) => {
      return t.actor.rollUnravellingTable();
    }));
  }
}
