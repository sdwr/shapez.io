import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector, Vector } from "../../core/vector";
import { STOP_PROPAGATION } from "../../core/signal";
import { BaseItem } from "../base_item";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MapChunkView } from "../map_chunk_view";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { MetaWorker } from "../buildings/units/worker";
import { getBuildingDataFromCode } from "../building_codes";
import { ResourceItem } from "../items/resource_item";
import { enumUnitStates } from "../components/dynamic_map_entity";
import { GameSystem } from "../game_system";
import { KEYMAPPINGS } from "../key_action_mapper";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { PlayerComponent } from "../components/player";
import { MetaPlayer } from "../buildings/units/player";

export class PlayerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [PlayerComponent]);
        this.bindKeys();

        // this.keyboardForce = new Vector();
    }

    bindKeys() {
        let mapper = this.root.keyMapper;
        // mapper.getBinding(KEYMAPPINGS.player.moveUp).add(() => (this.keyboardForce.y = -1));
        // mapper.getBinding(KEYMAPPINGS.player.moveDown).add(() => (this.keyboardForce.y = 1));
        // mapper.getBinding(KEYMAPPINGS.player.moveRight).add(() => (this.keyboardForce.x = 1));
        // mapper.getBinding(KEYMAPPINGS.player.moveLeft).add(() => (this.keyboardForce.x = -1));
    }

    /**
     * Called whenever an entity got changed
     * @param {Entity} entity
     */
    onEntityChanged(entity) {}

    update() {
        if (this.allEntities.length == 0) {
            this.player = this.spawnPlayer();
            this.player.hp = 100;
            this.player.hpMax = 100;
            this.root.playerEntity = this.player;
        } else {
            this.player = this.allEntities[0];
            this.root.playerEntity = this.player;
        }
        this.root.camera.setDesiredCenter(this.player.components.DynamicMapEntity.origin.toWorldSpace());
        this.updatePlayerDestination(this.player);
    }

    /**
     * Try to spawn player
     */
    spawnPlayer() {
        return this.spawnUnitAt(gMetaBuildingRegistry.findByClass(MetaPlayer), new Vector(2, 2));
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
     *
     * @param {Entity} entity
     */
    updatePlayerDestination(entity) {
        let actionMapper = this.root.keyMapper;
        let keyboardForce = new Vector(0, 0);
        if (actionMapper.getBinding(KEYMAPPINGS.player.moveUp).pressed) {
            keyboardForce.y = -1;
        }

        if (actionMapper.getBinding(KEYMAPPINGS.player.moveDown).pressed) {
            keyboardForce.y = 1;
        }

        if (actionMapper.getBinding(KEYMAPPINGS.player.moveLeft).pressed) {
            keyboardForce.x = -1;
        }

        if (actionMapper.getBinding(KEYMAPPINGS.player.moveRight).pressed) {
            keyboardForce.x = 1;
        }
        let dynamicComp = entity.components.DynamicMapEntity;
        dynamicComp.setDestination(dynamicComp.origin.add(keyboardForce));
    }
}
