export class DeeCombat {
  static rollInitiative(combat, data) {
    // Check groups
    data.combatants = [];
    let groups = {};
    combat.data.combatants.forEach((cbt) => {
      groups[cbt.flags.dee.group] = { present: true };
      data.combatants.push(cbt);
    });

    // Roll init
    let roll = new Roll("1d2").roll();
    roll.toMessage({
      flavor: game.i18n.format('DEE.roll.initiative')
    });
    if (roll.total === 1) {
      groups["white"].initiative = 3;
      groups["black"].initiative  = 2;
    } else {
      groups["white"].initiative = 2;
      groups["black"].initiative  = 3;
    }
    if (groups["grey"]) {
      groups["grey"].initiative = 1;
    }

    // Set init
    for (let i = 0; i < data.combatants.length; ++i) {
      if (!data.combatants[i].actor) {
        return;
      }
      data.combatants[i].initiative = groups[data.combatants[i].flags.dee.group].initiative;
    }
    combat.setupTurns();
  }

  static async resetInitiative(combat, data) {
    combat.resetAll();
  }

  static format(object, html, user) {

    html.find('.combat-control[data-control="rollNPC"]').remove();
    html.find('.combat-control[data-control="rollAll"]').remove();
    let trash = html.find(
      '.encounters .combat-control[data-control="endCombat"]'
    );
    $(
      '<a class="combat-control" data-control="reroll"><i class="fas fa-dice"></i></a>'
    ).insertBefore(trash);

    html.find(".combatant").each((_, ct) => {
      // Can't roll individual inits
      $(ct).find(".roll").remove();

      const cmbtant = object.combat.getCombatant(ct.dataset.combatantId);
      const color = cmbtant.flags.dee.group;
      // Append colored flag
      let controls = $(ct).find(".combatant-controls");
      controls.prepend(
        `<a class='combatant-control flag' style='color:${color}' title="${color}"><i class='fas fa-flag'></i></a>`
      );
    });
    DeeCombat.addListeners(html);
  }

  static updateCombatant(combat, combatant, data) {
    // Why do you reroll ?
    if (data.initiative) {
      let groupInit = data.initiative;
      // Check if there are any members of the group with init
      combat.combatants.forEach((ct) => {
        if (
          ct.initiative &&
          ct.id != data.id &&
          ct.flags.dee.group == combatant.flags.dee.group
        ) {
          groupInit = ct.initiative;
          // Set init
          data.initiative = parseInt(groupInit);
        }
      });
    }
  }

  static addListeners(html) {
    // Cycle through colors
    html.find(".combatant-control.flag").click((ev) => {
      if (!game.user.isGM) {
        return;
      }
      let currentColor = ev.currentTarget.style.color;
      let colors = ["black","grey","white"];
      let index = colors.indexOf(currentColor);
      index = (index + 1) % colors.length;
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      game.combat.updateCombatant({
        id: id,
        flags: { dee: { group: colors[index] } },
      });
    });

    html.find('.combat-control[data-control="reroll"]').click((ev) => {
      if (game.combat) {
        const data = {};
        DeeCombat.rollInitiative(game.combat, data);
        game.combat.update({ data: data }).then(() => {
          game.combat.setupTurns();
        });
      }
    });
  }

  static addCombatant(combat, data, options, id) {
    let token = canvas.tokens.get(data.tokenId);
    let color = "black";
    switch (token.data.disposition) {
      case -1:
        color = "black";
        break;
      case 0:
        color = "grey";
        break;
      case 1:
        color = "white";
        break;
    }
    data.flags = {
      dee: {
        group: color,
      },
    };
  }

  static activateCombatant(li) {
    const turn = game.combat.turns.findIndex(turn => turn.id === li.data('combatant-id'));
    game.combat.update({turn: turn})
  }

  static addContextEntry(html, options) {
    options.unshift({
      name: "Set Active",
      icon: '<i class="fas fa-star-of-life"></i>',
      callback: DeeCombat.activateCombatant
    });
    const idx = options.findIndex(e => e.name === "COMBAT.CombatantReroll");
    options.splice(idx, 1);
  }

  static async preUpdateCombat(combat, data, diff, id) {
    if (data.round) {
      if (data.round !== 1) {
        DeeCombat.resetInitiative(combat, data, diff, id);
        return;
      }
      DeeCombat.rollInitiative(combat, data, diff, id);
    }
  }
}
