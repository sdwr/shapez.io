import { Loader } from "../../core/loader";
import { AtlasSprite } from "../../core/sprites";
import { Entity } from "../entity";
import { GameRoot } from "../root";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { ResourceComponent } from "../components/resource";

/** @enum {string} */
export const enumResourceVariants = {
    stone: "stone",
    wood: "wood",
    gold: "gold",
};
export class MetaResourcesBuilding extends MetaBuilding {
    constructor() {
        super("resource");
    }

    /**
     * Returns the edit layer of the building
     * @returns {Layer}
     */
    getLayer() {
        return "resource";
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
    setupEntityComponents(entity) {
        entity.addComponent(new ResourceComponent());
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {string} variant
     * @returns {AtlasSprite}
     */
    getSprite(rotationVariant, variant) {
        return Loader.getSprite(
            "sprites/resources/" +
                this.id +
                (variant === defaultBuildingVariant ? "" : "-" + variant) +
                ".png"
        );
    }

    /**
     * Returns a preview sprite
     * @returns {AtlasSprite}
     */
    getPreviewSprite(rotationVariant = 0, variant = defaultBuildingVariant) {
        return Loader.getSprite(
            "sprites/resources/" +
                this.id +
                (variant === defaultBuildingVariant ? "" : "-" + variant) +
                ".png"
        );
    }

    /**
     * Returns a sprite for blueprints
     * @returns {AtlasSprite}
     */
    getBlueprintSprite(rotationVariant = 0, variant = defaultBuildingVariant) {
        return Loader.getSprite(
            "sprites/resources/" +
                this.id +
                (variant === defaultBuildingVariant ? "" : "-" + variant) +
                ".png"
        );
    }
}
