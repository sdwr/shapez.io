import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { DynamicMapEntityComponent, enumUnitStates } from "../components/dynamic_map_entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { Entity } from "../entity";
import { Vector } from "../../core/vector";
import { ResourceItem } from "../items/resource_item";

export class DynamicMapEntitySystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [DynamicMapEntityComponent]);

        this.lastFrame = this.root.time.now();
    }

    /**
     * @param {Entity} entity
     * @param {enumUnitStates} state
     */
    changeUnitState(entity, state) {
        const dynamicComp = entity.components.DynamicMapEntity;
        if (dynamicComp) {
            dynamicComp.changeState(state);
            this.root.signals.entityStateChange.dispatch(entity);
        }
    }

    /**
     * @param {Entity} entity
     * @param {Vector} destination
     */
    setDestination(entity, destination) {
        const dynamicComp = entity.components.DynamicMapEntity;
        if (dynamicComp) {
            dynamicComp.setDestination(destination);
            this.root.signals.entityStateChange.dispatch(entity);
        }
    }

    update() {
        // get tick time
        const now = this.root.time.now();
        const elapsedMs = now - this.lastFrame;
        this.lastFrame = now;

        // Go over all cache entries
        for (let i = 0; i < this.allEntities.length; ++i) {
            const sourceEntity = this.allEntities[i];
            const dynamicMapEntityComp = sourceEntity.components.DynamicMapEntity;
            let newPosition = dynamicMapEntityComp.calculatePosition(elapsedMs);
            if (newPosition) {
                let oldTile = dynamicMapEntityComp.origin;
                let newTile = newPosition;

                //update chunk if necessary
                let oldChunk = this.root.map.getOrCreateChunkAtTile(oldTile.x, oldTile.y);
                let newChunk = this.root.map.getOrCreateChunkAtTile(newTile.x, newTile.y);
                //update position
                if (oldChunk.x === newChunk.x && oldChunk.y === newChunk.y) {
                    dynamicMapEntityComp.origin = newPosition;
                } else {
                    if (newChunk.exists) {
                        dynamicMapEntityComp.origin = newPosition;
                        oldChunk.removeDynamicEntityFromChunk(sourceEntity);
                        newChunk.addDynamicEntityToChunk(sourceEntity);
                    } else {
                        if (sourceEntity.components.Player) {
                            newChunk.toggleExists();
                        }
                    }
                }
            }
        }
    }

    /**
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        for (let i = 0; i < chunk.dynamicContents.length; i++) {
            let entity = chunk.dynamicContents[i];

            const dynamicComp = entity.components.DynamicMapEntity;
            const sprite = dynamicComp.getSprite();
            if (sprite) {
                dynamicComp.drawSprite(parameters, sprite, 2);
            }
            const item = dynamicComp.carrying;
            if (item) {
                let pos = dynamicComp.origin.addScalar(0.5).toWorldSpace();
                item.drawItemCenteredClipped(pos.x, pos.y, parameters, globalConfig.defaultItemDiameter);
            }

            if (entity.team == 2) {
                let pos = dynamicComp.origin.addScalar(0.5).toWorldSpace();
                new ResourceItem("stone", 5).drawItemCenteredClipped(
                    pos.x,
                    pos.y,
                    parameters,
                    globalConfig.defaultItemDiameter
                );
            }

            if (entity.hp < entity.hpMax) {
                let perc = (entity.hp + 0.0) / entity.hpMax;
                let pos = dynamicComp.origin.mul(new Vector(globalConfig.tileSize, globalConfig.tileSize));
                parameters.context.fillStyle = "red";
                parameters.context.fillRect(pos.x, pos.y, globalConfig.tileSize, globalConfig.tileSize / 8);
                parameters.context.fillStyle = "green";
                parameters.context.fillRect(
                    pos.x,
                    pos.y,
                    globalConfig.tileSize * perc,
                    globalConfig.tileSize / 8
                );
            }
            let combatComp = entity.components.Combat;
            if (combatComp && combatComp.atkcooldown > 0) {
                let perc = combatComp.atkcooldown / combatComp.atkspeed;
                let pos = dynamicComp.origin.mul(new Vector(globalConfig.tileSize, globalConfig.tileSize));
                pos.add(new Vector(0.5, 0.75));
                parameters.context.strokeStyle = "blue";
                parameters.context.lineWidth = 3;
                parameters.context.beginPath();
                parameters.context.arc(
                    pos.x,
                    pos.y,
                    5,
                    (Math.PI * 3) / 2,
                    (Math.PI * 3) / 2 + Math.PI * 2 * perc,
                    false
                );
                parameters.context.stroke();
            }
        }
    }
}
