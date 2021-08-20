import { globalConfig } from "../core/config";
import { Vector } from "../core/vector";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { BaseItem } from "./base_item";
import { Entity } from "./entity";
import { MapChunkView } from "./map_chunk_view";
import { GameRoot } from "./root";

export class BaseMap extends BasicSerializableObject {
    static getId() {
        return "Map";
    }

    //goldLeft + tilesLeft refers to 1-deep ring around base
    static getSchema() {
        return {
            seed: types.uint,
            goldLeft: types.uint,
            tilesLeft: types.uint,
        };
    }

    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        super();
        this.root = root;

        this.seed = 0;
        this.goldLeft = 2;
        this.tilesLeft = 8;

        /**
         * Mapping of 'X|Y' to chunk
         * @type {Map<string, MapChunkView>} */
        this.chunksById = new Map();
    }

    /**
     * Returns the given chunk by index
     * @param {number} chunkX
     * @param {number} chunkY
     */
    getChunk(chunkX, chunkY, createIfNotExistent = false) {
        const chunkIdentifier = chunkX + "|" + chunkY;
        let storedChunk;

        if ((storedChunk = this.chunksById.get(chunkIdentifier))) {
            return storedChunk;
        }

        if (createIfNotExistent) {
            const instance = new MapChunkView(this.root, chunkX, chunkY);
            this.chunksById.set(chunkIdentifier, instance);
            return instance;
        }

        return null;
    }

    /**
     * Gets or creates a new chunk if not existent for the given tile
     * @param {number} tileX
     * @param {number} tileY
     * @returns {MapChunkView}
     */
    getOrCreateChunkAtTile(tileX, tileY) {
        const chunkX = Math.floor(tileX / globalConfig.mapChunkSize);
        const chunkY = Math.floor(tileY / globalConfig.mapChunkSize);
        return this.getChunk(chunkX, chunkY, true);
    }

    /**
     * Gets a chunk if not existent for the given tile
     * @param {number} tileX
     * @param {number} tileY
     * @returns {MapChunkView?}
     */
    getChunkAtTileOrNull(tileX, tileY) {
        const chunkX = Math.floor(tileX / globalConfig.mapChunkSize);
        const chunkY = Math.floor(tileY / globalConfig.mapChunkSize);
        return this.getChunk(chunkX, chunkY, false);
    }

    /**
     * Checks if a given tile is within the map bounds
     * @param {Vector} tile
     * @returns {boolean}
     */
    isValidTile(tile) {
        if (G_IS_DEV) {
            assert(tile instanceof Vector, "tile is not a vector");
        }
        return Number.isInteger(tile.x) && Number.isInteger(tile.y);
    }

    /**
     * Returns the tile content of a given tile
     * @param {Vector} tile
     * @param {Layer} layer
     * @returns {Entity} Entity or null
     */
    getTileContent(tile, layer) {
        if (G_IS_DEV) {
            this.internalCheckTile(tile);
        }
        const chunk = this.getChunkAtTileOrNull(tile.x, tile.y);
        return chunk && chunk.getLayerContentFromWorldCoords(tile.x, tile.y, layer);
    }

    /**
     * Returns the lower layers content of the given tile
     * @param {number} x
     * @param {number} y
     * @returns {BaseItem=}
     */
    getLowerLayerContentXY(x, y) {
        return this.getOrCreateChunkAtTile(x, y).getLowerLayerFromWorldCoords(x, y);
    }

    /**
     * Returns the tile content of a given tile
     * @param {number} x
     * @param {number} y
     * @param {Layer} layer
     * @returns {Entity} Entity or null
     */
    getLayerContentXY(x, y, layer) {
        const chunk = this.getChunkAtTileOrNull(x, y);
        return chunk && chunk.getLayerContentFromWorldCoords(x, y, layer);
    }

    /**
     * Returns the tile contents of a given tile
     * @param {number} x
     * @param {number} y
     * @returns {Array<Entity>} Entity or null
     */
    getLayersContentsMultipleXY(x, y) {
        const chunk = this.getChunkAtTileOrNull(x, y);
        if (!chunk) {
            return [];
        }
        return chunk.getLayersContentsMultipleFromWorldCoords(x, y);
    }

    /**
     * Checks if the tile is used
     * @param {Vector} tile
     * @param {Layer} layer
     * @returns {boolean}
     */
    isTileUsed(tile, layer) {
        if (G_IS_DEV) {
            this.internalCheckTile(tile);
        }
        const chunk = this.getChunkAtTileOrNull(tile.x, tile.y);
        return chunk && chunk.getLayerContentFromWorldCoords(tile.x, tile.y, layer) != null;
    }

    /**
     * Checks if the tile is used
     * @param {number} x
     * @param {number} y
     * @param {Layer} layer
     * @returns {boolean}
     */
    isTileUsedXY(x, y, layer) {
        const chunk = this.getChunkAtTileOrNull(x, y);
        return chunk && chunk.getLayerContentFromWorldCoords(x, y, layer) != null;
    }

    /**
     * Sets the tiles content
     * @param {Vector} tile
     * @param {Entity} entity
     */
    setTileContent(tile, entity) {
        if (G_IS_DEV) {
            this.internalCheckTile(tile);
        }

        this.getOrCreateChunkAtTile(tile.x, tile.y).setLayerContentFromWorldCords(
            tile.x,
            tile.y,
            entity,
            entity.layer
        );

        const staticComponent = entity.components.StaticMapEntity;
        assert(staticComponent, "Can only place static map entities in tiles");
    }

    /**
     * Places an entity with the StaticMapEntity/DynamicMapEntity component
     * @param {Entity} entity
     */
    placeEntity(entity) {
        const staticComp = entity.components.StaticMapEntity;
        const dynamicComp = entity.components.DynamicMapEntity;
        assert(staticComp || dynamicComp, "Entity is not creatable on map");
        if (staticComp) {
            const rect = staticComp.getTileSpaceBounds();
            for (let dx = 0; dx < rect.w; ++dx) {
                for (let dy = 0; dy < rect.h; ++dy) {
                    const x = rect.x + dx;
                    const y = rect.y + dy;
                    this.getOrCreateChunkAtTile(x, y).setLayerContentFromWorldCords(
                        x,
                        y,
                        entity,
                        entity.layer
                    );
                }
            }
        } else if (dynamicComp) {
            let origin = dynamicComp.origin;
            this.getOrCreateChunkAtTile(origin.x, origin.y).addDynamicEntityToChunk(entity);
        }
    }

    /**
     * Removes an entity with the StaticMapEntity component
     * @param {Entity} entity
     */
    removeEntity(entity) {
        const staticComp = entity.components.StaticMapEntity;
        const dynamicComp = entity.components.DynamicMapEntity;
        assert(staticComp || dynamicComp, "Entity is not deletable on map");
        if (staticComp) {
            const rect = staticComp.getTileSpaceBounds();
            for (let dx = 0; dx < rect.w; ++dx) {
                for (let dy = 0; dy < rect.h; ++dy) {
                    const x = rect.x + dx;
                    const y = rect.y + dy;
                    this.getOrCreateChunkAtTile(x, y).setLayerContentFromWorldCords(x, y, null, entity.layer);
                }
            }
        } else if (dynamicComp) {
            let origin = dynamicComp.origin;
            this.getOrCreateChunkAtTile(origin.x, origin.y).removeDynamicEntityFromChunk(entity);
        }
    }

    // Internal

    /**
     * Checks a given tile for validty
     * @param {Vector} tile
     */
    internalCheckTile(tile) {
        assert(tile instanceof Vector, "tile is not a vector: " + tile);
        assert(tile.x % 1 === 0, "Tile X is not a valid integer: " + tile.x);
        assert(tile.y % 1 === 0, "Tile Y is not a valid integer: " + tile.y);
    }
}
