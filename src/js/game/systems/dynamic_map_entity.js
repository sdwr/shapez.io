import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector } from "../../core/vector";
import { DynamicMapEntityComponent } from "../components/dynamic_map_entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";

export class DynamicMapEntitySystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [DynamicMapEntityComponent]);

        this.lastFrame = this.root.time.now();
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

                //update position
                dynamicMapEntityComp.origin = newPosition;

                //update chunk if necessary
                let oldChunk = this.root.map.getOrCreateChunkAtTile(oldTile.x, oldTile.y);
                let newChunk = this.root.map.getOrCreateChunkAtTile(newTile.x, newTile.y);
                if (oldChunk.x === newChunk.x && oldChunk.y === newChunk.y) {
                    continue;
                } else {
                    oldChunk.removeDynamicEntityFromChunk(sourceEntity);
                    newChunk.addDynamicEntityToChunk(sourceEntity);
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
                let pos = dynamicComp.origin.toWorldSpace();
                item.drawItemCenteredClipped(
                    pos.x + 0.5,
                    pos.y + 0.5,
                    parameters,
                    globalConfig.defaultItemDiameter
                );
            }
        }
    }
}
