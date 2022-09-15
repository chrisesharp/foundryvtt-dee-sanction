export class DeeSanctionPartySheet extends FormApplication {
  
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dee", "dialog", "party-sheet"],
      template: "systems/dee/templates/dialog/party-sheet.html",
      width: 630,
      height: 350,
      resizable: true,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "summary" }]
    });
  }
  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return game.i18n.localize("DEE.dialog.partysheet");
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    let partyTradecraft = game.user.getFlag("dee","tradecraft");
    if (!partyTradecraft) {
      game.user.setFlag("dee","tradecraft","");
    }
    const party = this.object.documents.filter(a=>a.getFlag("dee","party"));
    const abilities = {};
    party.forEach(e => {
      e.system.abilities.forEach(a => {
        let abs = abilities[a.name] || [];
        abs.push(e);
        abilities[a.name] = abs;
      });
    });
    const possessions = {};
    party.forEach(e => {
      e.system.possessions.mundane.forEach(a => {
        let abs = possessions[a.name] || [];
        abs.push(e);
        possessions[a.name] = abs;
      });
      e.system.possessions.esoteric.forEach(a => {
        let abs = possessions[`${a.name}*`] || [];
        abs.push(e);
        possessions[`${a.name}*`] = abs;
      });
    });
    const data = {
      data: this.object,
      party: party,
      abilities: abilities,
      possessions: possessions,
      config: CONFIG.DEE,
      user: game.user,
      settings: settings,
      tradecraft: partyTradecraft
    };
    return data;
  }

  /* -------------------------------------------- */

  async _selectActors(ev) {
    const entities = this.object.documents.sort((a, b) => b.prototypeToken.disposition - a.prototypeToken.disposition);
    const template = "/systems/dee/templates/dialog/party-select.html";
    const templateData = {
      actors: entities
    }
    const content = await renderTemplate(template, templateData);
    new Dialog({
      title: game.i18n.localize("DEE.dialog.selectagents"),
      content: content,
      buttons: {
        set: {
          icon: '<i class="fas fa-save"></i>',
          label: game.i18n.localize("DEE.Update"),
          callback: async (html) => {
            let checks = html.find("input[data-action='select-actor']");
            await Promise.all(checks.map(async (_, c) => {
              let key = c.getAttribute('name');
              await this.object.documents[key].setFlag('dee', 'party', c.checked);
            }));
            this.render(true);
          },
        },
      },
    }, {
      height: "auto", 
      width: 260,
      classes: ["dee","dialog","party-select"]
    })
    .render(true);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-controls .item-control .select-actors")
        .click(this._selectActors.bind(this));
    
    html.find("a.resync").click(() => this.render(true));

    html.find(".field-img button[data-action='open-sheet']").click((ev) => {
      let actorId = ev.currentTarget.parentElement.parentElement.parentElement.dataset.actorId;
      game.actors.get(actorId).sheet.render(true);
    })

    // Tradecraft select
    html.find('#tradecraft-sel').change(async (event)=> {
      event.preventDefault();
      const opt = $('#tradecraft-sel').val();
      const trade = CONFIG.DEE.tradecraft[opt]; 
      await game.user.setFlag("dee","tradecraft",trade);
      $('li.actor').each(async function() {
        const actorId = $(this).data('actor-id');
        if (actorId) {
          await game.actors.get(actorId).update({system:{tradecraft:trade}});
        }
      } );
      this.render(true);
    });
  }
}
