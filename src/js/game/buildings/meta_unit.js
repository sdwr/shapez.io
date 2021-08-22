import { Loader } from "../../core/loader";
import { AtlasSprite } from "../../core/sprites";
import { Entity } from "../entity";
import { GameRoot } from "../root";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";

export class MetaUnit extends MetaBuilding {
    constructor(id) {
        super(id);
    }

    getSpeed() {
        return 1;
    }

    /**
     * Returns the edit layer of the building
     * @returns {Layer}
     */
    getLayer() {
        return "dynamic";
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        let available = [defaultBuildingVariant];
        return available;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {}

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
