import { MetaBeltBuilding } from "../../buildings/belt";
import { MetaCutterBuilding } from "../../buildings/cutter";
import { MetaDisplayBuilding } from "../../buildings/display";
import { MetaFilterBuilding } from "../../buildings/filter";
import { MetaLeverBuilding } from "../../buildings/lever";
import { MetaMinerBuilding } from "../../buildings/miner";
import { MetaMixerBuilding } from "../../buildings/mixer";
import { MetaPainterBuilding } from "../../buildings/painter";
import { MetaReaderBuilding } from "../../buildings/reader";
import { MetaRotaterBuilding } from "../../buildings/rotater";
import { MetaBalancerBuilding } from "../../buildings/balancer";
import { MetaStackerBuilding } from "../../buildings/stacker";
import { MetaTrashBuilding } from "../../buildings/trash";
import { MetaUndergroundBeltBuilding } from "../../buildings/underground_belt";
import { HUDBaseToolbar } from "./base_toolbar";
import { MetaStorageBuilding } from "../../buildings/storage";
import { MetaItemProducerBuilding } from "../../buildings/item_producer";
import { queryParamOptions } from "../../../core/query_parameters";
import { MetaBarracksBuilding } from "../../buildings/barracks";
import { enumFighterVariant } from "../../buildings/units/fighter";
import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { getCodeFromBuildingData } from "../../building_codes";

export class HUDBuildingsToolbar extends HUDBaseToolbar {
    constructor(root) {
        super(root, {
            primaryBuildings: [
                getCodeFromBuildingData(
                    gMetaBuildingRegistry.findByClass(MetaBarracksBuilding),
                    "default",
                    0
                ),
                getCodeFromBuildingData(gMetaBuildingRegistry.findByClass(MetaBarracksBuilding), "archer", 0),
            ],
            visibilityCondition: () =>
                !this.root.camera.getIsMapOverlayActive() && this.root.currentLayer === "regular",
            htmlElementId: "ingame_HUD_BuildingsToolbar",
        });
    }
}
