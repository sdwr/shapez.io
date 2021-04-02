import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";

export class HUDResourceMenu extends BaseHUDPart {
    constructor(root) {
        super(root);

        /**
         * Store handles to the currently rendered elements, so we can update them more
         * convenient. Also allows for cleaning up handles.
         * @type {Array<{
         *  key: string,
         *  amountLabel: HTMLElement,
         *  resourceLabel: HTMLElement,
         *  lastRenderedValue: any,
         *  element: HTMLElement
         * }>}
         */
        this.handles = [];
        this.resourceKeys = ["STONE", "WOOD", "GOLD"];
    }
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_ResourceMenu", []);

        for (let i = 0; i < this.resourceKeys.length; i++) {
            const key = this.resourceKeys[i];
            const element = makeDiv(this.element, null, ["resource"]);
            const amountLabel = makeDiv(element, null, ["amountLabel"], "");
            const resourceLabel = makeDiv(element, null, ["resourceLabel"], key);
            let lastRenderedValue = -1;

            this.handles.push({
                key,
                amountLabel,
                resourceLabel,
                lastRenderedValue,
                element,
            });
        }
    }

    initialize() {}

    update() {
        for (let i = 0; i < this.handles.length; i++) {
            let handle = this.handles[i];

            let currentValue = this.root.resources.getResourceAmountByKey(handle.key);

            if (currentValue !== handle.lastRenderedValue) {
                handle.lastRenderedValue = currentValue;
                handle.amountLabel.innerText = currentValue;
            }
        }
    }
}
