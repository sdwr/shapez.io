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
            dynamicMapEntityComp.updatePosition(elapsedMs);
        }
    }

    /**
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        if (this.root.app.settings.getAllSettings().simplifiedBelts) {
            // Disabled in potato mode
            return;
        }

        const contents = chunk.containedEntitiesByLayer.regular;

        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const ejectorComp = entity.components.ItemEjector;
            if (!ejectorComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;

            for (let i = 0; i < ejectorComp.slots.length; ++i) {
                const slot = ejectorComp.slots[i];
                const ejectedItem = slot.item;

                if (!ejectedItem) {
                    // No item
                    continue;
                }

                if (!ejectorComp.renderFloatingItems && !slot.cachedTargetEntity) {
                    // Not connected to any building
                    continue;
                }

                // Limit the progress to the maximum available space on the next belt (also see #1000)
                let progress = slot.progress;
                const nextBeltPath = slot.cachedBeltPath;
                if (nextBeltPath) {
                    /*
                    If you imagine the track between the center of the building and the center of the first belt as
                    a range from 0 to 1:

                           Building              Belt
                    |         X         |         X         |
                    |         0...................1         |

                    And for example the first item on belt has a distance of 0.4 to the beginning of the belt:

                           Building              Belt
                    |         X         |         X         |
                    |         0...................1         |
                                               ^ item

                    Then the space towards this first item is always 0.5 (the distance from the center of the building to the beginning of the belt)
                    PLUS the spacing to the item, so in this case 0.5 + 0.4 = 0.9:

                    Building              Belt
                    |         X         |         X         |
                    |         0...................1         |
                                               ^ item @ 0.9

                    Since items must not get clashed, we need to substract some spacing (lets assume it is 0.6, exact value see globalConfig.itemSpacingOnBelts),
                    So we do 0.9 - globalConfig.itemSpacingOnBelts = 0.3

                    Building              Belt
                    |         X         |         X         |
                    |         0...................1         |
                                    ^           ^ item @ 0.9
                                    ^ max progress = 0.3

                    Because now our range actually only goes to the end of the building, and not towards the center of the building, we need to multiply
                    all values by 2:

                    Building              Belt
                    |         X         |         X         |
                    |         0.........1.........2         |
                                    ^           ^ item @ 1.8
                                    ^ max progress = 0.6

                    And that's it! If you summarize the calculations from above into a formula, you get the one below.
                    */

                    const maxProgress =
                        (0.5 + nextBeltPath.spacingToFirstItem - globalConfig.itemSpacingOnBelts) * 2;
                    progress = Math.min(maxProgress, progress);
                }

                // Skip if the item would barely be visible
                if (progress < 0.05) {
                    continue;
                }

                const realPosition = staticComp.localTileToWorld(slot.pos);
                if (!chunk.tileSpaceRectangle.containsPoint(realPosition.x, realPosition.y)) {
                    // Not within this chunk
                    continue;
                }

                const realDirection = staticComp.localDirectionToWorld(slot.direction);
                const realDirectionVector = enumDirectionToVector[realDirection];

                const tileX = realPosition.x + 0.5 + realDirectionVector.x * 0.5 * progress;
                const tileY = realPosition.y + 0.5 + realDirectionVector.y * 0.5 * progress;

                const worldX = tileX * globalConfig.tileSize;
                const worldY = tileY * globalConfig.tileSize;

                ejectedItem.drawItemCenteredClipped(
                    worldX,
                    worldY,
                    parameters,
                    globalConfig.defaultItemDiameter
                );
            }
        }
    }
}
