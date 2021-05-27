export class DiceDialog extends Dialog {
    constructor(data) {
        super(data);
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Step up die.
        html.find('a.step-up').click(async (event) => {
            event.preventDefault();
            const el = event.currentTarget.parentElement;
            return this._updateDieElement(el, 1);
        });

        // Step down die.
        html.find('a.step-down').click(async (event) => {
            event.preventDefault();
            const el = event.currentTarget.parentElement;
            return this._updateDieElement(el, -1);
        });
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
        $(el).siblings("input.formula").val(formula);
        $(el).siblings("img").attr("src",icon);
    }
}