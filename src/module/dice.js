import { DiceDialog } from "./dialog/dice-dialog.js";
const { renderTemplate } = foundry.applications.handlebars;

export class DeeSanctionDice {
    static async Roll({
        parts = [],
        data = {},
        speaker = null,
        flavor = null,
        title = null,
        chatMessage = true
      } = {}) {
        let rolled = false;
        const template = "systems/dee/templates/dialog/roll-dialog.html";
        let dialogData = {
          formula: parts.join(" "),
          data: data,
          rollMode: game.settings.get("core", "rollMode"),
          rollModes: CONFIG.Dice.rollModes,
        };
    
        let rollData = {
          parts: parts,
          data: data,
          title: title,
          flavor: flavor,
          speaker: speaker,
          chatMessage: chatMessage
        };
    
        let buttons = {
          ok: {
            label: game.i18n.localize("DEE.Roll"),
            icon: '<i class="fas fa-dice-d20"></i>',
            callback: (html) => {
              rolled = true;
              rollData.form = html[0].querySelector("form");
              rollData.formula = $(rollData.form).find("input.formula").val();
              return DeeSanctionDice.sendRoll(rollData);
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("DEE.Cancel"),
            callback: (html) => { },
          },
        };
    
        const html = await renderTemplate(template, dialogData);
        let roll;
    
        //Create Dialog window
        return new Promise((resolve) => {
          new DiceDialog({
            title: title,
            content: html,
            buttons: buttons,
            default: "ok",
            close: () => {
              resolve(rolled ? roll : false);
            },
          }).render(true);
        });
    }

    static async sendRoll({
        data = {},
        title = null,
        flavor = null,
        speaker = null,
        form = null,
        formula = null,
        chatMessage = true
      } = {}) {
        const template = "systems/dee/templates/chat/roll-result.html";
    
        let chatData = {
          user: game.user.id,
          speaker: speaker,
        };
    
        let templateData = {
          title: title,
          flavor: flavor,
          data: data,
        };
    
        const roll = await new Roll(formula, data).evaluate();
    
        // Convert the roll to a chat message and return the roll
        let rollMode = game.settings.get("core", "rollMode");
        rollMode = form ? form.rollMode.value : rollMode;
    
        // Force blind roll (ability formulas)
        if (!form && data.roll.blindroll) {
          rollMode = game.user.isGM ? "selfroll" : "blindroll";
        }
    
        if (["gmroll", "blindroll"].includes(rollMode))
          chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
        if (rollMode === "selfroll") chatData["whisper"] = [game.user.id];
        if (rollMode === "blindroll") {
          chatData["blind"] = true;
          data.roll.blindroll = true;
        }
    
        templateData.result = DeeSanctionDice.digestResult(data, roll);
    
        return new Promise((resolve) => {
          roll.render().then((r) => {
            templateData.rollDee = r;
            renderTemplate(template, templateData).then((content) => {
              chatData.content = content;
              // Dice So Nice
              if (game.dice3d) {
                game.dice3d
                  .showForRoll(
                    roll,
                    game.user,
                    true,
                    chatData.whisper,
                    chatData.blind
                  )
                  .then((displayed) => {
                    if (chatMessage !== false) {
                      ChatMessage.create(chatData);
                    }
                    resolve(roll);
                  });
              } else {
                chatData.sound = CONFIG.sounds.dice;
                if (chatMessage !== false) {
                  ChatMessage.create(chatData);
                }
                resolve(roll);
              }
            });
          });
        });
    }

    static digestResult(data, roll) {
        const result = {
          isSuccess: false,
          isFailure: false,
          target: data.roll.target,
          total: roll.total,
          type: data.rollType
        };
    
        let test;
        switch (data.roll.type) {
          case "above":
            test = (roll.total >= result.target);
            break;
          case "below":
            test = (roll.total <= result.target);
            break;
          default:
            test = (roll.total === result.target);
        }
        result.isFailure = !(result.isSuccess = test);
        return result;
      }
}