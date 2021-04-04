import { globalConfig } from "../../../core/config";
import { STOP_PROPAGATION } from "../../../core/signal";
import { Vector } from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { BaseHUDPart } from "../base_hud_part";

export class HUDAddChunk extends BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    /**
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    downPreHandler(pos, button) {
        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const chunk = this.root.map.getChunkAtTileOrNull(tile.x, tile.y);
        if (button === enumMouseButton.left) {
            if (chunk && !chunk.exists && this.tileIsCenterFour(tile, chunk)) {
                chunk.toggleExists();
                return STOP_PROPAGATION;
            } else if (chunk && chunk.exists && !chunk.isStart()) {
                if (this.tileIsTopRightCorner(tile, chunk)) {
                    chunk.toggleExists();
                    return STOP_PROPAGATION;
                }
            }
        }
    }

    tileIsTopRightCorner(tile, chunk) {
        if (tile.x === chunk.tileX + globalConfig.mapChunkSize - 1) {
            if (tile.y === chunk.tileY) {
                return true;
            }
        }
        return false;
    }

    tileIsCenterFour(tile, chunk) {
        if (tile.x >= chunk.tileX + 4 && tile.x < chunk.tileX + 8) {
            if (tile.y >= chunk.tileY + 4 && tile.y < chunk.tileY + 8) {
                return true;
            }
        }
        return false;
    }
}
