import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector, Vector } from "../../core/vector";
import { STOP_PROPAGATION } from "../../core/signal";
import { BaseItem } from "../base_item";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { MetaWorker } from "../buildings/units/worker";

export class MinerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [MinerComponent]);

        this.needsRecompute = true;

        this.root.signals.prePlacementCheck.add(this.prePlacementCheck, this);

        this.root.signals.entityAdded.add(this.onEntityAdded, this);
        this.root.signals.entityChanged.add(this.onEntityChanged, this);
        this.root.signals.entityDestroyed.add(this.onEntityChanged, this);
    }

    /**
     * Called whenever an entity got added
     * @param {Entity} entity
     */
    onEntityAdded(entity) {
        const minerComp = entity.components.Miner;
        if (minerComp) {
            this.spawnWorkers(entity);
        }
    }

    /**
     * Try to spawn workers for mine
     * @param {Entity} entity
     */
    spawnWorkers(entity) {
        const minerComp = entity.components.Miner;
        for (let i = 0; i < 4; i++) {
            let worker = this.spawnUnitAt(gMetaBuildingRegistry.findByClass(MetaWorker), new Vector(0, 0));
            worker.components.DynamicMapEntity.updateDestination(entity.components.StaticMapEntity.origin);
        }
    }

    spawnUnitAt(metaBuilding, tile) {
        const entity = this.root.logic.trySpawnUnit({
            origin: tile,
            speed: 1,
            destination: tile,
            rotation: 0,
            rotationVariant: 0,
            variant: "default",
            building: metaBuilding,
        });

        return entity;
    }

    /**
     * Called whenever an entity got changed
     * @param {Entity} entity
     */
    onEntityChanged(entity) {}

    /**
     * Performs pre-placement checks
     * @param {Entity} entity
     * @param {Vector} offset
     */
    prePlacementCheck(entity, offset) {
        const minerComp = entity.components.Miner;
        if (!minerComp) {
            return;
        }
        //get location
        let x = entity.components.StaticMapEntity.origin.x;
        let y = entity.components.StaticMapEntity.origin.y;
        if (offset) {
            x += offset.x;
            y += offset.y;
        }
        //check if miner is above resource
        const resource = this.root.map.getLayerContentXY(x, y, "resource");
        if (!resource) {
            return STOP_PROPAGATION;
        }
    }

    update() {
        let miningSpeed = this.root.hubGoals.getMinerBaseSpeed();
        if (G_IS_DEV && globalConfig.debug.instantMiners) {
            miningSpeed *= 100;
        }

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const minerComp = entity.components.Miner;

            // Reset everything on recompute
            if (this.needsRecompute) {
                minerComp.cachedChainedMiner = null;
            }

            // Check if miner is above an actual tile
            if (!minerComp.cachedMinedItem) {
                const staticComp = entity.components.StaticMapEntity;
                const tileBelow = this.root.map.getLowerLayerContentXY(
                    staticComp.origin.x,
                    staticComp.origin.y
                );
                if (!tileBelow) {
                    continue;
                }
                minerComp.cachedMinedItem = tileBelow;
            }

            //ADDING HERE

            // First, try to get rid of chained items
            if (minerComp.itemChainBuffer.length > 0) {
                if (this.tryPerformMinerEject(entity, minerComp.itemChainBuffer[0])) {
                    minerComp.itemChainBuffer.shift();
                    continue;
                }
            }

            const mineDuration = 1 / miningSpeed;
            const timeSinceMine = this.root.time.now() - minerComp.lastMiningTime;
            if (timeSinceMine > mineDuration) {
                // Store how much we overflowed
                const buffer = Math.min(timeSinceMine - mineDuration, this.root.dynamicTickrate.deltaSeconds);

                if (this.tryPerformMinerEject(entity, minerComp.cachedMinedItem)) {
                    // Analytics hook
                    this.root.signals.itemProduced.dispatch(minerComp.cachedMinedItem);
                    // Store mining time
                    minerComp.lastMiningTime = this.root.time.now() - buffer;
                }
            }
        }

        // After this frame we are done
        this.needsRecompute = false;
    }

    /**
     * Finds the target chained miner for a given entity
     * @param {Entity} entity
     * @returns {Entity|false} The chained entity or null if not found
     */
    findChainedMiner(entity) {
        const ejectComp = entity.components.ItemEjector;
        const staticComp = entity.components.StaticMapEntity;
        const contentsBelow = this.root.map.getLowerLayerContentXY(staticComp.origin.x, staticComp.origin.y);
        if (!contentsBelow) {
            // This miner has no contents
            return null;
        }

        const ejectingSlot = ejectComp.slots[0];
        const ejectingPos = staticComp.localTileToWorld(ejectingSlot.pos);
        const ejectingDirection = staticComp.localDirectionToWorld(ejectingSlot.direction);

        const targetTile = ejectingPos.add(enumDirectionToVector[ejectingDirection]);
        const targetContents = this.root.map.getTileContent(targetTile, "regular");

        // Check if we are connected to another miner and thus do not eject directly
        if (targetContents) {
            const targetMinerComp = targetContents.components.Miner;
            if (targetMinerComp && targetMinerComp.chainable) {
                const targetLowerLayer = this.root.map.getLowerLayerContentXY(targetTile.x, targetTile.y);
                if (targetLowerLayer) {
                    return targetContents;
                }
            }
        }

        return false;
    }

    /**
     *
     * @param {Entity} entity
     * @param {BaseItem} item
     */
    tryPerformMinerEject(entity, item) {
        const minerComp = entity.components.Miner;
        const ejectComp = entity.components.ItemEjector;

        // Check if we are a chained miner
        if (minerComp.chainable) {
            const targetEntity = minerComp.cachedChainedMiner;

            // Check if the cache has to get recomputed
            if (targetEntity === null) {
                minerComp.cachedChainedMiner = this.findChainedMiner(entity);
            }

            // Check if we now have a target
            if (targetEntity) {
                const targetMinerComp = targetEntity.components.Miner;
                if (targetMinerComp.tryAcceptChainedItem(item)) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        // Seems we are a regular miner or at the end of a row, try actually ejecting
        if (ejectComp.tryEject(0, item)) {
            return true;
        }

        return false;
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;

        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const minerComp = entity.components.Miner;
            if (!minerComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            if (!minerComp.cachedMinedItem) {
                continue;
            }

            // Draw the item background - this is to hide the ejected item animation from
            // the item ejector

            const padding = 3;
            const destX = staticComp.origin.x * globalConfig.tileSize + padding;
            const destY = staticComp.origin.y * globalConfig.tileSize + padding;
            const dimensions = globalConfig.tileSize - 2 * padding;

            if (parameters.visibleRect.containsRect4Params(destX, destY, dimensions, dimensions)) {
                parameters.context.fillStyle = minerComp.cachedMinedItem.getBackgroundColorAsResource();
                parameters.context.fillRect(destX, destY, dimensions, dimensions);
            }

            minerComp.cachedMinedItem.drawItemCenteredClipped(
                (0.5 + staticComp.origin.x) * globalConfig.tileSize,
                (0.5 + staticComp.origin.y) * globalConfig.tileSize,
                parameters,
                globalConfig.defaultItemDiameter
            );
        }
    }
}
