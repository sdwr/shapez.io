import { DrawParameters } from "../../core/draw_parameters";
import { GameSystem } from "../game_system";
import { MapChunkView } from "../map_chunk_view";
import { getBuildingDataFromCode } from "../building_codes";

export class ResourceSystem extends GameSystem {
    /**
     * Draws the map resources
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.resource;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            let code = entity.components.StaticMapEntity.code;
            let data = getBuildingDataFromCode(code);
            let sprite = data.sprite;
            entity.components.StaticMapEntity.drawSpriteOnBoundsClipped(parameters, sprite, 0);
        }
    }
}
