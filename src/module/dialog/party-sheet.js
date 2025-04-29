const { ApplicationV2, DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;
const { renderTemplate } = foundry.applications.handlebars;

export class DeeSanctionPartySheet extends HandlebarsApplicationMixin(ApplicationV2) {
  #party;

  constructor (options) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    id: 'party-sheet',
    classes: ['dee', 'dialog', 'party-sheet'],
    position: {
      width: 500,
      height: 350,
    },
    actions: {
      selectActors: DeeSanctionPartySheet._selectActors,
      selectTradecraft: DeeSanctionPartySheet._selectTradecraft,
      showActor: DeeSanctionPartySheet._showActor,
    },
    window: {
      title: 'DEE.dialog.partysheet',
      resizable: true,
      contentClasses: ['standard-form', 'dee', 'dialog', 'party-sheet'],
    },
    form: {
      closeOnSubmit: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/dee/templates/dialog/partials/party-sheet-header.hbs',
    },
    tabs: {
      template: 'systems/dee/templates/dialog/partials/party-sheet-nav.hbs',
    },
    summary: {
      template: 'systems/dee/templates/dialog/partials/party-sheet-summary.hbs',
    },
    abilities: {
      template: 'systems/dee/templates/dialog/partials/party-sheet-abilities.hbs',
    },
    possessions: {
      template: 'systems/dee/templates/dialog/partials/party-sheet-possessions.hbs',
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
  }

  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'summary';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'DEE.tabs.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        default:
          tab.id = partId;
          tab.label += partId;
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  async _prepareContext(options) {
    this.#party = this._preparePartyData();
    const partyTradecraft = game.user.getFlag("dee","tradecraft");
    if (!partyTradecraft) {
      game.user.setFlag("dee","tradecraft","");
    }
    const data = {
      party: this.#party,
      // abilities: this._prepareAbilities(),
      // possessions: this._preparePossessions(),
      config: CONFIG.DEE,
      user: game.user,
      settings: settings,
      tradecraft: partyTradecraft,
      tabs: this._getTabs(options.parts),
    };
    return data;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'abilities':
        context.tab = context.tabs[partId];
        context.abilities = this._prepareAbilities();
        break;
      case 'possessions':
        context.tab = context.tabs[partId];
        context.possessions = this._preparePossessions();
        break;
      default:
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }

  _preparePartyData() {
    const actors = game.actors?.filter((a) => { 
      const isMember = a.getFlag('dee', 'party');
      return isMember === true;
    }) ?? [];
    return actors;
  }

  _prepareAbilities() {
    const abilities = {};
    this.#party.forEach(e => {
      e.system.abilities.forEach(a => {
        let abs = abilities[a.name] || [];
        abs.push(e);
        abilities[a.name] = abs;
      });
    });
    return abilities;
  }

  _preparePossessions() {
    const possessions = {};
    this.#party.forEach(e => {
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
    return possessions;
  }

  /* -------------------------------------------- */

  static async _selectActors(ev) {
    const actors = game.actors.filter((e)=> e).sort((a, b) => b.prototypeToken.disposition - a.prototypeToken.disposition);
    const template = "systems/dee/templates/dialog/party-select.hbs";
    const templateData = {
      actors: actors
    }
    const content = await renderTemplate(template, templateData);
    await DialogV2.wait({
      classes: ["dee","dialog","party-select"],
      window: {
        title: 'DEE.dialog.selectagents',
        width: 260,
      },
      
      content: content,
      buttons: [
        {
          action: 'set',
          icon: 'fas fa-save',
          label: 'DEE.Update',
          callback: async (html) => {
            const checks = Array.from(html.currentTarget.querySelectorAll("input[data-action='select-actor']"));
            await Promise.all(checks.map(async (c) => {
              const actorId = c.dataset.actorId;
              const actor = game.actors.get(actorId);
              const isChecked = c.checked;
              await actor.setFlag('dee', 'party', isChecked );
            }));
          },
        },
      ],
    });
    this.render(true);
  }

  static async _selectTradecraft(event, target) {
    event.preventDefault();
    const opt = target.value;
    const trade = CONFIG.DEE.tradecraft[opt]; 
    await game.user.setFlag("dee","tradecraft",trade);
    const sheet = target.closest('#party-sheet');
    const actors = Array.from(sheet.querySelectorAll('li.actor'));
    
    await Promise.all(actors.map(async (a) => {
      const actorId = a.dataset.actorId;
      if (actorId) {
        await game.actors.get(actorId).update({system:{tradecraft:trade}});
      }
    }));
  }

  static async _showActor(_event, target) {
    const actorId = target.parentElement.parentElement.parentElement.dataset.actorId;
    game.actors.get(actorId).sheet.render(true);
  }
}
