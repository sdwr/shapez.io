import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { BarracksComponent } from "../components/barracks";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

/** @enum {string} */
export const enumBarracksVariants = { quad: "quad" };

export class MetaBarracksBuilding extends MetaBuilding {
    constructor() {
        super("barracks");
    }

    getSilhouetteColor() {
        return "#7dcda2";
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(1, 1);
            case enumBarracksVariants.quad:
                return new Vector(4, 1);
            default:
                assertAlways(false, "Unknown barracks variant: " + variant);
        }
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getProcessorBaseSpeed(
            variant === enumBarracksVariants.quad
                ? enumItemProcessorTypes.cutterQuad
                : enumItemProcessorTypes.cutter
        );
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_quad)) {
            return [defaultBuildingVariant, enumBarracksVariants.quad];
        }
        return super.getAvailableVariants(root);
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new BarracksComponent("fighter"));
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                break;
            }

            default:
                assertAlways(false, "Unknown barracks variant: " + variant);
        }
    }
}
