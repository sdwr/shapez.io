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
import { getBuildingDataFromCode } from "../building_codes";
import { ResourceItem } from "../items/resource_item";
import { enumUnitStates } from "../components/dynamic_map_entity";
import { BarracksComponent } from "../components/barracks";
import { KEYMAPPINGS } from "../key_action_mapper";

export class BarracksSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BarracksComponent]);
    }

    /**
     * Called whenever an entity got added
     * @param {Entity} entity
     */
    onEntityAdded(entity) {}

    /**
     * Try to spawn workers for mine
     * @param {Entity} entity
     */
    spawnWorker(entity) {
        const barracksComp = entity.components.Barracks;
        const unitType = barracksComp.unitType;

        let offset = new Vector(Math.random() * 2, Math.random() * 2);

        let worker = this.spawnUnitAt(
            gMetaBuildingRegistry.findById(unitType),
            entity.components.StaticMapEntity.origin.add(offset)
        );
        worker.team = entity.team;
        entity.children.push(worker.uid);
    }

    spawnUnitAt(metaUnit, tile) {
        const entity = this.root.logic.trySpawnUnit({
            origin: tile,
            speed: metaUnit.getSpeed(),
            destination: tile,
            rotation: 0,
            rotationVariant: 0,
            variant: "default",
            building: metaUnit,
        });

        return entity;
    }

    /**
     * Called whenever an entity got changed
     * @param {Entity} entity
     */
    onEntityChanged(entity) {}

    update() {
        let miningSpeed = this.root.hubGoals.getMinerBaseSpeed();
        if (G_IS_DEV && globalConfig.debug.instantMiners) {
            miningSpeed *= 100;
        }

        let actionMapper = this.root.keyMapper;
        let rally = actionMapper.getBinding(KEYMAPPINGS.player.rally);

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const barracksComp = entity.components.Barracks;

            const mineDuration = 1 / miningSpeed;
            const timeSinceMine = this.root.time.now() - barracksComp.lastMiningTime;
            if (timeSinceMine > mineDuration) {
                // Store how much we overflowed
                const buffer = Math.min(timeSinceMine - mineDuration, this.root.dynamicTickrate.deltaSeconds);

                //create child unit
                if (entity.children.length < 2) {
                    this.spawnWorker(entity);
                }
            }

            // clean up dead units, start from end so splice works
            // should make backlinks from children or new system at some point to make efficient
            // this sucks because it runs every frame
            for (let i = entity.children.length - 1; i >= 0; i--) {
                let childId = entity.children[i];
                let child = this.root.entityMgr.findByUid(childId);
                if (!child) {
                    entity.children.splice(i, 1);
                }
            }
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {}
}
