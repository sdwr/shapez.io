import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { Vector } from "../core/vector";
import { getBuildingDataFromCode } from "../game/building_codes";
import { Entity } from "../game/entity";
import { MapChunk } from "../game/map_chunk";
import { GameRoot } from "../game/root";

const logger = createLogger("serializer_internal");

// Internal serializer methods
export class SerializerInternal {
    /**
     * Serializes an map of map chunks
     * @param {Map<string, MapChunk>} map
     */
    serializeChunkMap(map) {
        const serialized = [];
        const chunks = map.entries();
        let next = chunks.next();
        while (!next.done) {
            let chunk = next.value[1];
            if (chunk && chunk.exists) {
                serialized.push(chunk.serialize());
            }
            next = chunks.next();
        }
        return serialized;
    }

    /**
     *
     * @param {GameRoot} root
     * @param {Array<MapChunk>} array
     * @returns {string|void}
     */
    deserializeChunkArray(root, array) {
        for (let i = 0; i < array.length; ++i) {
            this.deserializeChunk(root, array[i]);
        }
    }

    /**
     *
     * @param {GameRoot} root
     * @param {MapChunk} payload
     */
    deserializeChunk(root, payload) {
        let chunk = root.map.getOrCreateChunkAtTile(payload.tileX, payload.tileY);
        if (chunk && payload.exists) {
            chunk.exists = true;
        }
    }

    /**
     * Serializes an array of entities
     * @param {Array<Entity>} array
     */
    serializeEntityArray(array) {
        const serialized = [];
        for (let i = 0; i < array.length; ++i) {
            const entity = array[i];
            if (!entity.queuedForDestroy && !entity.destroyed) {
                serialized.push(entity.serialize());
            }
        }
        return serialized;
    }

    /**
     *
     * @param {GameRoot} root
     * @param {Array<Entity>} array
     * @returns {string|void}
     */
    deserializeEntityArray(root, array) {
        for (let i = 0; i < array.length; ++i) {
            this.deserializeEntity(root, array[i]);
        }
    }

    /**
     *
     * @param {GameRoot} root
     * @param {Entity} payload
     */
    deserializeEntity(root, payload) {
        if (payload.components.StaticMapEntity) {
            this.deserializeStaticEntity(root, payload);
        } else if (payload.components.DynamicMapEntity) {
            this.deserializeDynamicEntity(root, payload);
        } else {
            assert("entity has no data");
        }
    }

    deserializeStaticEntity(root, payload) {
        const staticData = payload.components.StaticMapEntity;
        assert(staticData, "entity has no static data");

        const code = staticData.code;
        const data = getBuildingDataFromCode(code);

        const metaBuilding = data.metaInstance;

        const entity = metaBuilding.createStaticEntity({
            root,
            origin: Vector.fromSerializedObject(staticData.origin),
            rotation: staticData.rotation,
            originalRotation: staticData.originalRotation,
            rotationVariant: data.rotationVariant,
            variant: data.variant,
        });

        entity.uid = payload.uid;
        entity.children = payload.children;
        entity.class = payload.class;
        entity.team = payload.team;
        entity.hp = payload.hp;
        entity.hpMax = payload.hpMax;

        this.deserializeComponents(root, entity, payload.components);

        root.entityMgr.registerEntity(entity, payload.uid);
        root.map.placeEntity(entity);
    }

    deserializeDynamicEntity(root, payload) {
        const dynamicData = payload.components.DynamicMapEntity;
        assert(dynamicData, "entity has no dynamic data");

        const code = dynamicData.code;
        const data = getBuildingDataFromCode(code);

        const metaBuilding = data.metaInstance;

        const entity = metaBuilding.createDynamicEntity({
            root,
            origin: Vector.fromSerializedObject(dynamicData.origin),
            speed: dynamicData.speed,
            destination: Vector.fromSerializedObject(dynamicData.destination),
            state: dynamicData.state,
            carrying: dynamicData.carrying,
            rotation: dynamicData.rotation,
            rotationVariant: data.rotationVariant,
            variant: data.variant,
        });

        entity.uid = payload.uid;
        entity.team = payload.team;
        entity.class = payload.class;
        entity.hp = payload.hp;
        entity.hpMax = payload.hpMax;

        this.deserializeComponents(root, entity, payload.components);

        root.entityMgr.registerEntity(entity, payload.uid);
        root.map.placeEntity(entity);
    }

    /////// COMPONENTS ////

    /**
     * Deserializes components of an entity
     * @param {GameRoot} root
     * @param {Entity} entity
     * @param {Object.<string, any>} data
     * @returns {string|void}
     */
    deserializeComponents(root, entity, data) {
        for (const componentId in data) {
            if (!entity.components[componentId]) {
                if (G_IS_DEV && !globalConfig.debug.disableSlowAsserts) {
                    // @ts-ignore
                    if (++window.componentWarningsShown < 100) {
                        logger.warn("Entity no longer has component:", componentId);
                    }
                }
                continue;
            }

            const errorStatus = entity.components[componentId].deserialize(data[componentId], root);
            if (errorStatus) {
                return errorStatus;
            }
        }
    }
}
