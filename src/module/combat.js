export class DeeCombat {
  static async rollInitiative(combat) {
    // Check groups
    let groups = {};
    combat.data.combatants.forEach((cbt) => {
      let group = cbt.getFlag("dee","group");
      groups[group] = { present: true };
    });

    // Roll init
    let roll = new Roll("1d2");
    await roll.evaluate({async:true});
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
    combat.data.combatants.forEach((cbt) => {
      combat.setInitiative(cbt.id, groups[cbt.getFlag("dee","group")].initiative);
    });
    game.combat.setupTurns();
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

      const cmbtant = object.viewed.combatants.get(ct.dataset.combatantId);
      const color = cmbtant.getFlag("dee","group");
      // Append colored flag
      let controls = $(ct).find(".combatant-controls");
      controls.prepend(
        `<a class='combatant-control flag' style='color:${color}' title="${color}"><i class='fas fa-flag'></i></a>`
      );
    });
    DeeCombat.addListeners(html);
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
      let combatant = game.combat.data.combatants.get(id);
      combatant.update({
        id: id,
        flags: { dee: { group: colors[index] } },
      });
    });

    html.find('.combat-control[data-control="reroll"]').click(async (ev) => {
      if (game.combat) {
        await DeeCombat.rollInitiative(game.combat);
      }
    });
  }

  static addCombatant(combatant, data, options, id) {
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
    let flags = {
      "dee": {
        "group": color
      }
    };
    combatant.data.update({flags: flags});
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
}
