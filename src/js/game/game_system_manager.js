/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { createLogger } from "../core/logging";
import { BeltSystem } from "./systems/belt";
import { ItemEjectorSystem } from "./systems/item_ejector";
import { MapResourcesSystem } from "./systems/map_resources";
import { MinerSystem } from "./systems/miner";
import { ItemProcessorSystem } from "./systems/item_processor";
import { UndergroundBeltSystem } from "./systems/underground_belt";
import { HubSystem } from "./systems/hub";
import { StaticMapEntitySystem } from "./systems/static_map_entity";
import { ItemAcceptorSystem } from "./systems/item_acceptor";
import { StorageSystem } from "./systems/storage";
import { WiredPinsSystem } from "./systems/wired_pins";
import { BeltUnderlaysSystem } from "./systems/belt_underlays";
import { WireSystem } from "./systems/wire";
import { ConstantSignalSystem } from "./systems/constant_signal";
import { LogicGateSystem } from "./systems/logic_gate";
import { LeverSystem } from "./systems/lever";
import { DisplaySystem } from "./systems/display";
import { ItemProcessorOverlaysSystem } from "./systems/item_processor_overlays";
import { BeltReaderSystem } from "./systems/belt_reader";
import { FilterSystem } from "./systems/filter";
import { ItemProducerSystem } from "./systems/item_producer";
import { ResourceSystem } from "./systems/resources";
import { DynamicMapEntitySystem } from "./systems/dynamic_map_entity";
import { PlayerSystem } from "./systems/player";
import { BarracksSystem } from "./systems/barracks";
import { CombatSystem } from "./systems/combat";

const logger = createLogger("game_system_manager");

export class GameSystemManager {
    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        this.systems = {
            /* typehints:start */
            /** @type {BeltSystem} */
            belt: null,

            /** @type {ItemEjectorSystem} */
            itemEjector: null,

            /** @type {MapResourcesSystem} */
            mapResources: null,

            /** @type {ResourceSystem} */
            resources: null,

            /** @type {DynamicMapEntitySystem} */
            dynamicMapEntities: null,

            /** @type {MinerSystem} */
            miner: null,

            /** @type {BarracksSystem} */
            barracks: null,

            /** @type {ItemProcessorSystem} */
            itemProcessor: null,

            /** @type {UndergroundBeltSystem} */
            undergroundBelt: null,

            /** @type {HubSystem} */
            hub: null,

            /** @type {StaticMapEntitySystem} */
            staticMapEntities: null,

            /** @type {ItemAcceptorSystem} */
            itemAcceptor: null,

            /** @type {StorageSystem} */
            storage: null,

            /** @type {WiredPinsSystem} */
            wiredPins: null,

            /** @type {BeltUnderlaysSystem} */
            beltUnderlays: null,

            /** @type {WireSystem} */
            wire: null,

            /** @type {ConstantSignalSystem} */
            constantSignal: null,

            /** @type {LogicGateSystem} */
            logicGate: null,

            /** @type {LeverSystem} */
            lever: null,

            /** @type {DisplaySystem} */
            display: null,

            /** @type {ItemProcessorOverlaysSystem} */
            itemProcessorOverlays: null,

            /** @type {BeltReaderSystem} */
            beltReader: null,

            /** @type {FilterSystem} */
            filter: null,

            /** @type {ItemProducerSystem} */
            itemProducer: null,

            /** @type {PlayerSystem} */
            playerSystem: null,

            /** @type {CombatSystem} */
            combatSystem: null,

            /* typehints:end */
        };
        this.systemUpdateOrder = [];

        this.internalInitSystems();
    }

    /**
     * Initializes all systems
     */
    internalInitSystems() {
        const add = (id, systemClass) => {
            this.systems[id] = new systemClass(this.root);
            this.systemUpdateOrder.push(id);
            this.root.dynamicTickrate.systemMs.push({ key: id, ticks: 0, average: 0, max: 0 });
        };

        // Order is important!

        // IMPORTANT: Item acceptor must be before the belt, because it may not tick after the belt
        // has put in the item into the acceptor animation, otherwise its off
        add("itemAcceptor", ItemAcceptorSystem);

        add("belt", BeltSystem);

        add("undergroundBelt", UndergroundBeltSystem);

        add("miner", MinerSystem);

        add("storage", StorageSystem);

        add("itemProcessor", ItemProcessorSystem);

        add("filter", FilterSystem);

        add("itemProducer", ItemProducerSystem);

        add("itemEjector", ItemEjectorSystem);

        add("mapResources", MapResourcesSystem);

        add("resources", ResourceSystem);

        add("hub", HubSystem);

        add("staticMapEntities", StaticMapEntitySystem);

        add("dynamicMapEntities", DynamicMapEntitySystem);

        add("wiredPins", WiredPinsSystem);

        add("beltUnderlays", BeltUnderlaysSystem);

        add("constantSignal", ConstantSignalSystem);

        add("playerSystem", PlayerSystem);

        add("barracksSystem", BarracksSystem);

        //entities get queued for destruction here
        add("combatSystem", CombatSystem);

        // WIRES section
        add("lever", LeverSystem);

        // Wires must be before all gate, signal etc logic!
        add("wire", WireSystem);

        // IMPORTANT: We have 2 phases: In phase 1 we compute the output values of all gates,
        // processors etc. In phase 2 we propagate it through the wires network
        add("logicGate", LogicGateSystem);
        add("beltReader", BeltReaderSystem);

        add("display", DisplaySystem);

        add("itemProcessorOverlays", ItemProcessorOverlaysSystem);

        logger.log("📦 There are", this.systemUpdateOrder.length, "game systems");
    }

    /**
     * Updates all systems
     */
    update() {
        this.root.dynamicTickrate.systemMs;
        for (let i = 0; i < this.systemUpdateOrder.length; ++i) {
            let time = performance.now();
            const system = this.systems[this.systemUpdateOrder[i]];
            system.update();

            time = Math.round(performance.now() - time);
            let systemMs = this.root.dynamicTickrate.systemMs[i];
            systemMs.average = time;
            systemMs.max = Math.max(systemMs.max, time);
        }
    }

    refreshCaches() {
        for (let i = 0; i < this.systemUpdateOrder.length; ++i) {
            const system = this.systems[this.systemUpdateOrder[i]];
            system.refreshCaches();
        }
    }
}
