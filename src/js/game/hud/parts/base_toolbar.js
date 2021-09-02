import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { STOP_PROPAGATION } from "../../../core/signal";
import { makeDiv, safeModulo } from "../../../core/utils";
import { getBuildingDataFromCode, getCodeFromBuildingData } from "../../building_codes";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { MetaBuilding } from "../../meta_building";
import { GameRoot } from "../../root";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDBaseToolbar extends BaseHUDPart {
    /**
     * @param {GameRoot} root
     * @param {object} param0
     * @param {Array<number>} param0.primaryBuildings
     * @param {function} param0.visibilityCondition
     * @param {string} param0.htmlElementId
     * @param {Layer=} param0.layer
     */
    constructor(root, { primaryBuildings = [], visibilityCondition, htmlElementId, layer = "regular" }) {
        super(root);

        this.primaryBuildings = primaryBuildings;
        this.visibilityCondition = visibilityCondition;
        this.htmlElementId = htmlElementId;
        this.layer = layer;

        this.selected = null;
        this.lastSelectedIndex = 0;

        this.rowPrimary = null;

        /** @type {Object.<number, {
         * metaBuilding: MetaBuilding,
         * variant: string,
         * rotationVariant: number,
         * unlocked: boolean,
         * selected: boolean,
         * element: HTMLElement,
         * index: number
         * }>} */
        this.buildingHandles = {};
    }

    /**
     * Should create all require elements
     * @param {HTMLElement} parent
     */
    createElements(parent) {
        this.element = makeDiv(parent, this.htmlElementId, ["ingame_buildingsToolbar"], "");
    }

    initialize() {
        const actionMapper = this.root.keyMapper;

        let buildBinding = actionMapper.getBinding(KEYMAPPINGS.player.build);
        buildBinding.add(() => this.tryBuildSelected());

        let leftBinding = actionMapper.getBinding(KEYMAPPINGS.player.cycleLeft);
        let rightBinding = actionMapper.getBinding(KEYMAPPINGS.player.cycleRight);

        leftBinding.add(() => this.cycleBuilding(false));
        rightBinding.add(() => this.cycleBuilding(true));

        this.rowPrimary = makeDiv(this.element, null, ["buildings", "primary"]);

        for (let i = 0; i < this.primaryBuildings.length; i++) {
            let code = this.primaryBuildings[i];
            this.addBuildingToToolbar(code);
        }

        // for (let i = 0; i < allBuildings.length; ++i) {
        //     const metaBuilding = gMetaBuildingRegistry.findByClass(allBuildings[i]);

        //     let rawBinding = KEYMAPPINGS.buildings[metaBuilding.getId() + "_" + this.layer];
        //     if (!rawBinding) {
        //         rawBinding = KEYMAPPINGS.buildings[metaBuilding.getId()];
        //     }

        //     const binding = actionMapper.getBinding(rawBinding);

        //     const itemContainer = makeDiv(
        //         this.primaryBuildings.includes(allBuildings[i]) ? rowPrimary : rowSecondary,
        //         null,
        //         ["building"]
        //     );
        //     itemContainer.setAttribute("data-icon", "building_icons/" + metaBuilding.getId() + ".png");
        //     itemContainer.setAttribute("data-id", metaBuilding.getId());

        //     binding.add(() => this.selectBuildingForPlacement(metaBuilding));

        //     this.trackClicks(itemContainer, () => this.selectBuildingForPlacement(metaBuilding), {
        //         clickSound: null,
        //     });

        //     this.buildingHandles[metaBuilding.id] = {
        //         metaBuilding,
        //         element: itemContainer,
        //         unlocked: false,
        //         selected: false,
        //         index: i,
        //     };
        // }

        this.root.hud.signals.selectedPlacementBuildingChanged.add(
            this.onSelectedPlacementBuildingChanged,
            this
        );

        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0.12,
            attachClass: "visible",
        });
        actionMapper.getBinding(KEYMAPPINGS.placement.cycleBuildings).add(this.cycleBuildings, this);
    }

    addBuildingToToolbar(code) {
        let actionMapper = this.root.keyMapper;
        let buildingData = getBuildingDataFromCode(code);
        let metaBuilding = buildingData.metaInstance;
        let variant = buildingData.variant ? buildingData.variant : "default";
        let rotationVariant = buildingData.rotationVariant ? buildingData.rotationVariant : 0;

        let i = Object.keys(this.buildingHandles).length;

        let rawBinding = KEYMAPPINGS.buildings[new Number(i + 1).toString()];
        if (!rawBinding) {
            console.error("Could not find keybind for building #" + i + 1);
        }

        const binding = actionMapper.getBinding(rawBinding);

        const itemContainer = makeDiv(this.rowPrimary, null, ["building"]);
        itemContainer.setAttribute("data-icon", "building_icons/" + metaBuilding.getId() + ".png");
        itemContainer.setAttribute("data-id", metaBuilding.getId());

        binding.add(() => this.selectBuilding(code));

        this.trackClicks(itemContainer, () => this.selectBuilding(code), {
            clickSound: null,
        });

        this.buildingHandles[code] = {
            metaBuilding,
            variant,
            rotationVariant,
            element: itemContainer,
            unlocked: false,
            selected: false,
            index: i,
        };

        if (!this.selected) {
            this.selectBuilding(code);
            this.lastSelectedIndex = i;
        }
    }

    /**
     * Updates the toolbar
     */
    update() {
        const visible = this.visibilityCondition();
        this.domAttach.update(visible);

        if (visible) {
            let recomputeSecondaryToolbarVisibility = false;
            for (const code in this.buildingHandles) {
                const handle = this.buildingHandles[code];
                const newStatus = handle.metaBuilding.getIsUnlocked(this.root);
                if (handle.unlocked !== newStatus) {
                    handle.unlocked = newStatus;
                    handle.element.classList.toggle("unlocked", newStatus);
                }
            }
        }
    }

    /**
     * Cycles through all buildings
     */
    cycleBuildings() {
        // const visible = this.visibilityCondition();
        // if (!visible) {
        //     return;
        // }
        // let newBuildingFound = false;
        // let newIndex = this.lastSelectedIndex;
        // const direction = this.root.keyMapper.getBinding(KEYMAPPINGS.placement.rotateInverseModifier).pressed
        //     ? -1
        //     : 1;
        // for (let i = 0; i <= this.primaryBuildings.length; ++i) {
        //     newIndex = safeModulo(newIndex + direction, this.primaryBuildings.length);
        //     const metaBuilding = gMetaBuildingRegistry.findById(this.primaryBuildings[newIndex]);
        //     const handle = this.buildingHandles[metaBuilding.id];
        //     if (!handle.selected && handle.unlocked) {
        //         newBuildingFound = true;
        //         break;
        //     }
        // }
        // if (!newBuildingFound) {
        //     return;
        // }
        // const metaBuildingClass = this.primaryBuildings[newIndex];
        // const metaBuilding = gMetaBuildingRegistry.findByClass(metaBuildingClass);
        // this.selectBuildingForPlacement(metaBuilding);
    }

    cycleBuilding(right = true) {
        const direction = right ? 1 : -1;
        let newIndex = this.lastSelectedIndex;
        newIndex = safeModulo(newIndex + direction, Object.keys(this.buildingHandles).length);
        for (const code in this.buildingHandles) {
            if (this.buildingHandles[code].index == newIndex) {
                this.selectBuilding(code);
            }
        }
    }

    selectBuilding(code) {
        let oldSelected = this.buildingHandles[this.selected];
        let newSelected = this.buildingHandles[code];
        if (oldSelected) {
            oldSelected.selected = false;
            oldSelected.element.classList.toggle("selected", false);
        }
        newSelected.selected = true;
        newSelected.element.classList.toggle("selected", true);
        this.selected = code;
        this.lastSelectedIndex = newSelected.index;
    }

    tryBuildSelected() {
        const origin = this.root.playerEntity.components.DynamicMapEntity.origin;
        let building = this.buildingHandles[this.selected];

        this.root.logic.tryPlaceBuilding({
            origin: origin.round(),
            rotation: 0,
            rotationVariant: building.rotationVariant,
            originalRotation: 0,
            variant: building.variant,
            building: building.metaBuilding,
        });
    }

    /**
     * Called when the selected building got changed
     * @param {MetaBuilding} metaBuilding
     */
    onSelectedPlacementBuildingChanged(metaBuilding) {
        for (const code in this.buildingHandles) {
            const handle = this.buildingHandles[code];
            const newStatus = handle.metaBuilding === metaBuilding;
            if (handle.selected !== newStatus) {
                handle.selected = newStatus;
                handle.element.classList.toggle("selected", newStatus);
            }
            if (handle.selected) {
                this.lastSelectedIndex = handle.index;
            }
        }

        this.element.classList.toggle("buildingSelected", !!metaBuilding);
    }

    /**
     * @param {MetaBuilding} metaBuilding
     */
    selectBuildingForPlacement(metaBuilding, variant = "default", rotationVariant = 0) {
        if (!this.visibilityCondition()) {
            // Not active
            return;
        }

        if (!metaBuilding.getIsUnlocked(this.root)) {
            this.root.soundProxy.playUiError();
            return STOP_PROPAGATION;
        }

        // Allow clicking an item again to deselect it
        for (const buildingId in this.buildingHandles) {
            const handle = this.buildingHandles[buildingId];
            if (handle.selected && handle.metaBuilding === metaBuilding) {
                metaBuilding = null;
                break;
            }
        }

        this.root.soundProxy.playUiClick();
        this.root.hud.signals.buildingSelectedForPlacement.dispatch(metaBuilding);
        this.onSelectedPlacementBuildingChanged(metaBuilding);
    }
}
