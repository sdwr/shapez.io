import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { enumResources } from "../resource_types";
import { THEME } from "../theme";

export class ResourceItem extends BaseItem {
    static getId() {
        return "resource";
    }

    static getSchema() {
        return {
            type: types.enum(enumResources),
            amount: types.int,
        };
    }

    serialize() {
        return this.type;
    }

    deserialize(data) {
        this.type = data;
    }

    /** @returns {"resource"} **/
    getItemType() {
        return "resource";
    }

    /**
     * @param {enumResources} type
     */
    constructor(type, amount = 0) {
        super();
        this.type = type;
        this.amount = amount;
    }

    /**
     * Draws the item to a canvas
     * @param {CanvasRenderingContext2D} context
     * @param {number} size
     */
    drawFullSizeOnCanvas(context, size) {
        if (!this.cachedSprite) {
            this.cachedSprite = Loader.getSprite("sprites/resources/" + "resource-" + this.type + ".png");
        }
        this.cachedSprite.drawCentered(context, size / 2, size / 2, size);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} diameter
     * @param {DrawParameters} parameters
     */
    drawItemCenteredClipped(x, y, parameters, diameter = globalConfig.defaultItemDiameter) {
        const realDiameter = diameter * 0.6;
        if (!this.cachedSprite) {
            this.cachedSprite = Loader.getSprite("sprites/resources/" + "resource-" + this.type + ".png");
        }
        this.cachedSprite.drawCachedCentered(parameters, x, y, realDiameter);
    }

    getBackgroundColorAsResource() {
        return THEME.map.resources["shape"];
    }
}

/**
 * Singleton instances
 * @type {Object<enumResources, ResourceItem>}
 */
export const RESOURCE_ITEM_SINGLETONS = {};

for (const type in enumResources) {
    RESOURCE_ITEM_SINGLETONS[type] = new ResourceItem(type);
}
