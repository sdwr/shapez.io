import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { enumResources } from "../../resource_types";
import { KEYMAPPINGS } from "../../key_action_mapper";

export class HUDFPSCounter extends BaseHUDPart {
    constructor(root) {
        super(root);

        /**
         * Store handles to the currently rendered elements, so we can update them more
         * convenient. Also allows for cleaning up handles.
         * @type {Array<{
         *  key: string,
         *  amountLabel: HTMLElement,
         *  maxLabel: HTMLElement,
         *  resourceLabel: HTMLElement,
         *  lastRenderedValue: any,
         *  element: HTMLElement
         * }>}
         */
        this.handles = [];
        this.fpsHandle = null;
        this.resourceKeys = Object.keys(this.root.systemMgr.systems);
        this.disabled = false;
    }
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_FPSCounter", []);

        const element = makeDiv(this.element, null, ["child"]);
        const amountLabel = makeDiv(element, null, ["amountLabel"], "");
        const resourceLabel = makeDiv(element, null, ["nameLabel"], "FPS");
        let lastRenderedValue = 0;
        this.fpsHandle = { key: "FPS", amountLabel, resourceLabel, lastRenderedValue, element };

        for (let i = 0; i < this.resourceKeys.length; i++) {
            const key = this.resourceKeys[i];
            const element = makeDiv(this.element, null, ["child"]);
            const amountLabel = makeDiv(element, null, ["amountLabel"], "");
            const br = makeDiv(element, null, ["spacing"], " - ");
            const maxLabel = makeDiv(element, null, ["maxLabel"], key);
            const resourceLabel = makeDiv(element, null, ["resourceLabel"], key);
            let lastRenderedValue = -1;

            this.handles.push({
                key,
                amountLabel,
                maxLabel,
                resourceLabel,
                lastRenderedValue,
                element,
            });
        }
    }

    initialize() {
        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.toggleFPSDetails).add(() => this.toggleDisabled);
    }

    update() {
        let fps = this.root.dynamicTickrate.averageFps;
        if (this.fpsHandle.lastRenderedValue !== fps) {
            this.fpsHandle.lastRenderedValue = fps;
            this.fpsHandle.amountLabel.innerText = fps;
        }

        for (let i = 0; i < this.handles.length; i++) {
            let handle = this.handles[i];

            let currentValue = this.root.dynamicTickrate.systemMs[i].average;

            if (currentValue !== handle.lastRenderedValue) {
                handle.lastRenderedValue = currentValue;
                handle.amountLabel.innerText = currentValue;
                handle.maxLabel.innerText = this.root.dynamicTickrate.systemMs[i].max;
            }
        }
    }
}
