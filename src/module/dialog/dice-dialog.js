const { DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class DiceDialog extends DialogV2 {
    constructor(options) {
        super(options);
    }
    static DEFAULT_OPTIONS = {
        classes: ['dee', 'sheet', 'dice'],
        actions: {
            stepUp: this.stepUp,
            stepDown: this.stepDown,
        },
    };

    static async stepUp(event, target) {
        event.preventDefault();
        const el = target.parentElement;
        return this._updateDieElement(el, 1);
    }

    static async stepDown(event, target) {
        event.preventDefault();
        const el = target.parentElement;
        return this._updateDieElement(el, -1);
    }
    /**
     * Handle updating an actor's resource
     * @param {String} el   the HTML element clicked ( die )
     * @param {Number} delta  The amount (positive or negative) to adjust the resource by
     * @private
     */
    _updateDieElement(el, delta) {
        delta = parseInt(delta);
        let dieStep = parseInt(el.dataset.val);
        dieStep = (delta > 0) ? Math.min(dieStep + delta, 5) : Math.max(dieStep + delta, 0);
        const die = 2+ (2 * dieStep);
        const formula = `d${die}`;
        const icon = CONFIG.DEE.icons[formula];
        el.dataset.val = dieStep;
        const root = el.parentElement.parentElement.parentElement;
        root.querySelector("input.formula").value = formula;
        root.querySelector("img").setAttribute("src",icon);
    }
}