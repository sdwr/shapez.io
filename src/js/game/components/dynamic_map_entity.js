import { globalConfig } from "../../core/config";
import { Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { getBuildingDataFromCode } from "../building_codes";
import { AtlasSprite } from "../../core/sprites";
import { BaseItem } from "../base_item";
import { typeItemSingleton } from "../item_resolver";
import { DrawParameters } from "../../core/draw_parameters";

/**
 * @enum {string}
 */
export const enumUnitStates = {
    idle: "idle",
    moving: "moving",
    building: "building",
};

export class DynamicMapEntityComponent extends Component {
    static getId() {
        return "DynamicMapEntity";
    }

    static getSchema() {
        // cachedMinedItem is not serialized.
        return {
            origin: types.vector,
            speed: types.uint,
            destination: types.vector,
            rotation: types.float,

            state: types.string,
            carrying: types.nullable(typeItemSingleton),
            code: types.uint,
        };
    }

    /**
     * Returns the effective tile size
     * @returns {Vector}
     */
    getTileSize() {
        return getBuildingDataFromCode(this.code).tileSize;
    }

    /**
     * Returns the sprite
     * @returns {AtlasSprite}
     */
    getSprite() {
        return getBuildingDataFromCode(this.code).sprite;
    }

    /**
     * Returns the blueprint sprite
     * @returns {AtlasSprite}
     */
    getBlueprintSprite() {
        return getBuildingDataFromCode(this.code).blueprintSprite;
    }

    /**
     * Returns the silhouette color
     * @returns {string}
     */
    getSilhouetteColor() {
        return getBuildingDataFromCode(this.code).silhouetteColor;
    }

    /**
     * Returns the meta building
     * @returns {import("../meta_building").MetaBuilding}
     */
    getMetaBuilding() {
        return getBuildingDataFromCode(this.code).metaInstance;
    }

    /**
     * Returns the buildings variant
     * @returns {string}
     */
    getVariant() {
        return getBuildingDataFromCode(this.code).variant;
    }

    /**
     *
     * @param {object} param0
     * @param {Vector=} param0.origin Origin (Top Left corner) of the entity
     * @param {number=} param0.speed Speed of the entity in tiles/s
     * @param {Vector=} param0.destination Destination tile
     * @param {number=} param0.rotation Rotation in degrees. Must be multiple of 90
     * @param {string=} param0.state Unit state
     * @param {BaseItem} param0.carrying Item held
     * @param {number=} param0.code Building code
     */
    constructor({
        origin = new Vector(),
        speed = 1,
        destination = new Vector(),
        rotation = 0,
        state = enumUnitStates.idle,
        code = 0,
        carrying = null,
    }) {
        super();
        this.origin = origin.copy();
        this.speed = speed;
        this.destination = destination.copy();
        this.rotation = rotation;
        this.code = code;
        this.carrying = carrying;
        this.state = state;
    }

    /**
     *
     * @param {enumUnitStates} state
     */
    changeState(state) {
        this.state = state;
    }

    //careful of origin vs center
    // origin of entities is top left corner
    calculatePosition(elapsedMs) {
        // let centerOffset = this.tileSize.divideScalar(2);
        // let center = this.origin.add(centerOffset);
        let newPosition = this.origin;
        if (this.destination.equals(this.origin)) {
            this.state = enumUnitStates.idle;
            return null;
        }

        let dist = this.destination.sub(this.origin);
        let distScalar = dist.length();

        let distanceTraveled = this.speed * elapsedMs;
        if (distanceTraveled >= distScalar) {
            newPosition = this.destination;
        } else {
            let fractionTraveled = distanceTraveled / distScalar;
            newPosition = this.origin.add(dist.multiplyScalar(fractionTraveled));
        }

        return newPosition;
    }

    /**
     *
     * @param {Vector=} destination
     */
    setDestination(destination) {
        this.destination = destination.copy();
        if (!this.destination.equals(this.origin)) {
            this.rotation = Math.round(Math.degrees(destination.sub(this.origin).angle()));
            this.state = enumUnitStates.moving;
        }
    }

    /**
     * @param {DrawParameters} parameters
     * @param {AtlasSprite} sprite
     */
    drawSprite(parameters, sprite, extrudePixels = 0) {
        const size = this.getTileSize();
        let worldX = this.origin.x * globalConfig.tileSize;
        let worldY = this.origin.y * globalConfig.tileSize;

        if (this.rotation === 0) {
            // Early out, is faster
            sprite.drawCached(
                parameters,
                worldX - extrudePixels * size.x,
                worldY - extrudePixels * size.y,
                globalConfig.tileSize * size.x + 2 * extrudePixels * size.x,
                globalConfig.tileSize * size.y + 2 * extrudePixels * size.y
            );
        } else {
            const rotationCenterX = worldX + globalConfig.halfTileSize;
            const rotationCenterY = worldY + globalConfig.halfTileSize;

            parameters.context.translate(rotationCenterX, rotationCenterY);
            parameters.context.rotate(Math.radians(this.rotation));
            sprite.drawCached(
                parameters,
                -globalConfig.halfTileSize - extrudePixels * size.x,
                -globalConfig.halfTileSize - extrudePixels * size.y,
                globalConfig.tileSize * size.x + 2 * extrudePixels * size.x,
                globalConfig.tileSize * size.y + 2 * extrudePixels * size.y,
                false // no clipping possible here
            );
            parameters.context.rotate(-Math.radians(this.rotation));
            parameters.context.translate(-rotationCenterX, -rotationCenterY);
        }
    }
    /**
     * Transforms from local tile space to global tile space
     * @param {Vector} localTile
     * @returns {Vector}
     */
    localTileToWorld(localTile) {
        const result = localTile.rotateFastMultipleOf90(this.rotation);
        result.x += this.origin.x;
        result.y += this.origin.y;
        return result;
    }
}
