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
import { CombatComponent } from "../components/combat";
import { compressObject } from "../../savegame/savegame_compressor";

export class CombatSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [CombatComponent]);
        this.lastFrame = performance.now();
    }

    update() {
        // get tick time
        const now = performance.now();
        const elapsedMs = now - this.lastFrame;
        this.lastFrame = now;

        let actionMapper = this.root.keyMapper;
        let rally = actionMapper.getBinding(KEYMAPPINGS.player.rally);

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const combatComp = entity.components.Combat;

            combatComp.updateCooldown(elapsedMs);

            if (rally.pressed && entity.team == 1 && !entity.components.Player) {
                let offset = new Vector(Math.random() * 2, Math.random() * 2);
                entity.components.DynamicMapEntity.setDestination(
                    this.root.playerEntity.components.DynamicMapEntity.origin.add(offset)
                );
            } else if (!entity.components.Player) {
                //try attack
                this.tryAttack(entity);
            }
        }

        //kill off units after updating
        //should be done at end of update because allEntities gets updated immediately
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const combatComp = entity.components.Combat;
            if (entity.hp <= 0) {
                this.kill(entity);
            }
        }
    }

    kill(entity) {
        this.root.logic.tryDeleteEntity(entity);
    }

    /**
     *
     * @param {Entity} entity
     */
    tryAttack(entity) {
        let combatComp = entity.components.Combat;
        if (combatComp.atkcooldown <= 0) {
            if (combatComp.target) {
                let target = this.root.entityMgr.findByUid(combatComp.target, false);
                if (target) {
                    if (this.distToTarget(entity, target) <= combatComp.range) {
                        entity.components.DynamicMapEntity.setDestination(
                            entity.components.DynamicMapEntity.origin
                        );
                        entity.components.DynamicMapEntity.setRotation(
                            target.components.DynamicMapEntity.origin
                        );
                        this.attack(entity, target);
                    } else {
                        this.findTarget(entity);
                        if (combatComp.target) {
                            let target = this.root.entityMgr.findByUid(combatComp.target, false);
                            if (target) {
                                entity.components.DynamicMapEntity.setDestination(
                                    target.components.DynamicMapEntity.origin
                                );
                            }
                        }
                    }
                }
            } else {
                this.findTarget(entity);
            }
        }
    }

    /**
     *
     * @param {Entity} entity
     * @param {Entity} target
     */
    attack(entity, target) {
        let combatComp = entity.components.Combat;
        combatComp.atkcooldown = combatComp.atkspeed;
        target.hp -= combatComp.damage;
        if (target.hp <= 0) {
            combatComp.target = 0;
        }
    }

    /**
     *
     * @param {Entity} entity
     */
    findTarget(entity) {
        //get all dynamic entities in surrounding chunks
        let dynamicComp = entity.components.DynamicMapEntity;
        let entities = [];
        let entityChunk = this.root.map.getOrCreateChunkAtTile(dynamicComp.origin.x, dynamicComp.origin.y);
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                let chunk = this.root.map.getChunk(entityChunk.x + x, entityChunk.y + y, true);
                entities.push(...chunk.dynamicContents);
            }
        }

        //find closest enemy
        let closest = 9999;
        let target = null;
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team != entity.team) {
                let dist = this.distToTarget(entity, e);
                if (dist < closest && dist < 10) {
                    closest = dist;
                    target = e;
                }
            }
        }
        if (target && closest < entity.components.Combat.range * 2) {
            entity.components.Combat.target = target.uid;
        }
    }

    /**
     *
     * @param {Entity} entity
     * @param {Entity} target
     */
    distToTarget(entity, target) {
        let rangeToTarget = entity.components.DynamicMapEntity.origin.sub(
            target.components.DynamicMapEntity.origin
        );
        return rangeToTarget.length();
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {}
}
