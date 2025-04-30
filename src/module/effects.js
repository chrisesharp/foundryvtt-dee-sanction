export function createConsequenceEffect(resource, value, owner) {
    const change = {key:`data.resource.${resource}.value`,mode:2,value:value};
    const effectData =  {
        icon: "icons/svg/aura.svg",
        origin: owner.uuid,
        name: owner.name,
        duration: {
          combat: undefined,
          rounds: undefined,
          seconds: undefined,
          startRound: 1,
          startTime: 0,
          startTurn: 0,
          turns: undefined
        },
        flags: {},
        disabled: false,
        transfer: true,
        changes: [change]
    };
    return ActiveEffect.create(effectData, {parent: owner})
}

/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning entity which manages this effect
 */
export function onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("li");
    const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
    switch ( a.dataset.action ) {
        case "create":
            return ActiveEffect.create({
                label: "New Effect",
                icon: "icons/svg/aura.svg",
                origin: owner.uuid,
                "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
                disabled: li.dataset.effectType === "inactive"
            },
            {parent:owner});
        case "edit":
        return effect.sheet.render(true);
        case "delete":
        return effect.delete();
        case "toggle":
        return effect.update({disabled: !effect.disabled});
    }
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects) {

    // Define effect header categories
    const categories = {
    temporary: {
        type: "temporary",
        label: "Temporary",
        effects: []
    },
    passive: {
        type: "passive",
        label: "Passive",
        effects: []
    },
    inactive: {
        type: "inactive",
        label: "Inactive",
        effects: []
    }
    };

    // Iterate over active effects, classifying them into categories
    for ( let e of effects ) {
        e.sourceName; // Trigger a lookup for the source name
        if ( e.disabled ) categories.inactive.effects.push(e);
        else if ( e.isTemporary ) categories.temporary.effects.push(e);
        else categories.passive.effects.push(e);
    }
    return categories;
}
