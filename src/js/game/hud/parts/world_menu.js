import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { enumNotificationType } from "./notifications";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDWorldMenu extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_WorldMenu", []);
    }

    initialize() {
    }

    update() {
    }

}
