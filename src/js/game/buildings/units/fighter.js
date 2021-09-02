import { Loader } from "../../../core/loader";
import { AtlasSprite } from "../../../core/sprites";
import { Entity } from "../../entity";
import { GameRoot } from "../../root";
import { MetaUnit } from "../meta_unit";
import { defaultBuildingVariant } from "../../meta_building";
import { Vector } from "../../../core/vector";
import { CombatComponent } from "../../components/combat";

/** @enum {string} */
export const enumFighterVariant = {
    default: "default",
    archer: "archer",
    cannon: "cannon",
    baneling: "baneling",
    mage: "mage",
};

export class MetaFighter extends MetaUnit {
    constructor() {
        super("fighter");
    }

    getSpeed() {
        return 2;
    }
    /**
     * Returns the edit layer of the building
     * @returns {Layer}
     */
    getLayer() {
        return "dynamic";
    }

    /**
     * Should return the dimensions of the building
     */
    getDimensions(variant = defaultBuildingVariant) {
        return new Vector(0.75, 0.75);
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        let available = [
            defaultBuildingVariant,
            enumFighterVariant.archer,
            enumFighterVariant.baneling,
            enumFighterVariant.cannon,
            enumFighterVariant.mage,
        ];
        return available;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new CombatComponent());
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
            }
        }
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {string} variant
     * @returns {AtlasSprite}
     */
    getSprite(rotationVariant, variant) {
        return Loader.getSprite(
            "sprites/units/" + this.id + (variant === defaultBuildingVariant ? "" : "-" + variant) + ".png"
        );
    }

    /**
     * Returns a preview sprite
     * @returns {AtlasSprite}
     */
    getPreviewSprite(rotationVariant = 0, variant = defaultBuildingVariant) {
        return Loader.getSprite(
            "sprites/units/" + this.id + (variant === defaultBuildingVariant ? "" : "-" + variant) + ".png"
        );
    }

    /**
     * Returns a sprite for blueprints
     * @returns {AtlasSprite}
     */
    getBlueprintSprite(rotationVariant = 0, variant = defaultBuildingVariant) {
        return Loader.getSprite(
            "sprites/units/" + this.id + (variant === defaultBuildingVariant ? "" : "-" + variant) + ".png"
        );
    }
}
