import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { enumNotificationType } from "./notifications";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDResourceMenu extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_ResourceMenu", []);

        this.resources = [
            {
                id: "stone",
                label: "Stone",
                amount: 0,
            },
            {
                id: "wood",
                label: "Wood",
                amount: 0,
            },
            {
                id: "gold",
                label: "Gold",
                amount: 0,
            }
        ];

        /** @type {Array<{
         * badge: function,
         * button: HTMLElement,
         * badgeElement: HTMLElement,
         * lastRenderAmount: number,
         * condition?: function,
         * notification: [string, enumNotificationType]
         * }>} */
        this.badgesToUpdate = [];

        /** @type {Array<{
         * button: HTMLElement,
         * condition: function,
         * domAttach: DynamicDomAttach
         * }>} */
        this.visibilityToUpdate = [];

        this.resources.forEach(({ id, label, amount }) => {
            const resource = document.createElement("resource_row");
            let amountLabel = makeDiv(re)
            resource.classList.add(id);
            this.element.appendChild(resource);
        });
    }

    initialize() {
    }

    update() {
        this.updateResources();
    }

    updateResources() {
        for(let i = 0; i < this.resources.length; i++) {
            let r = this.root.resources.getResourceByKey(this.resources[i].id);
        }
    }
}
