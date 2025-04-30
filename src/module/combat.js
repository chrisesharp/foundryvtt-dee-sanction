export class DeeCombat {
  static async rollInitiative(combat) {
    // Check groups
    let groups = {};
    combat.combatants.forEach((cbt) => {
      let group = cbt.getFlag("dee","group");
      groups[group] = { present: true };
    });

    // Roll init
    let roll = new Roll("1d2");
    await roll.evaluate();
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
    combat.combatants.forEach((cbt) => {
      combat.setInitiative(cbt.id, groups[cbt.getFlag("dee","group")].initiative);
    });
    game.combat.setupTurns();
  }

  static format(object, html) {
    html.querySelector('.combat-control[data-action="rollNPC"]')?.remove();
    html.querySelector('.combat-control[data-action="rollAll"]')?.remove();
    const gear = html.querySelector('button[data-action="trackerSettings"]');
    if (gear) {
      gear.previousElementSibling.insertAdjacentHTML('afterend', '<button type="button" class="inline-control roll icon fas fa-dice" data-action="reroll" data-tooltip aria-label="roll initiative"></button>');
    }

    html.querySelectorAll(".combatant").forEach((ct) => {
      // Can't roll individual inits
      ct.querySelector(".roll")?.remove();
      const cmbtant = object.viewed.combatants.get(ct.dataset.combatantId);
      const colors = ["black","grey","white"];
      const color = cmbtant.getFlag("dee","group");
      // Append colored flag
      const controls = ct.querySelector(".combatant-controls");
      if (controls) controls.innerHTML = `<a class='combatant-control flag' style='color:${color}' title="${colors[color]}"><i class='fas fa-flag'></i></a>` + controls.innerHTML;
    });
    DeeCombat.addListeners(html);
  }

  static addListeners(html) {
    // Cycle through colors
    html.querySelectorAll(".combatant-control.flag").forEach((el) => {
      el.addEventListener('click', (ev) => {
        if (!game.user.isGM) {
          return;
        }
        const currentColor = ev.currentTarget.style.color;
        const colors = ["black","grey","white"];
        const index = (colors.indexOf(currentColor) + 1) % colors.length;
        const id = ev.currentTarget.closest(".combatant").dataset.combatantId;
        const cbnt = game.combat.combatants.get(id);
        cbnt.update({
          id: id,
          flags: { dee: { group: colors[index] } },
        });
      });
    });

    html.querySelectorAll('.combat-control[data-action="reroll"]').forEach((el) => {
      el.addEventListener('click', async () => {
        if (!game.combat) return;
        const data = {};
        await DeeCombat.rollInitiative(game.combat, data);
      });
    });
  }

  static async addCombatant(combatant, data, options, id) {
    const token = canvas.tokens.get(data.tokenId);
    let color = "black";
    switch (token.document.disposition) {
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
    combatant.updateSource({flags: flags});
  }

  static activateCombatant(li) {
    const turn = game.combat.turns.findIndex(turn => turn.id === li.dataset.combatantId);
    game.combat.update({turn: turn})
  }

  static addContextEntry(html, options) {
    options.unshift({
      name: "Set Active",
      icon: '<i class="fas fa-star-of-life"></i>',
      callback: OWBCombat.activateCombatant
    });
    const idx = options.findIndex(e => e.name === "COMBAT.CombatantReroll");
    options.splice(idx, 1);
  }
}
