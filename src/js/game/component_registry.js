import { gComponentRegistry } from "../core/global_registries";
import { StaticMapEntityComponent } from "./components/static_map_entity";
import { BeltComponent } from "./components/belt";
import { ItemEjectorComponent } from "./components/item_ejector";
import { ItemAcceptorComponent } from "./components/item_acceptor";
import { MinerComponent } from "./components/miner";
import { ItemProcessorComponent } from "./components/item_processor";
import { UndergroundBeltComponent } from "./components/underground_belt";
import { HubComponent } from "./components/hub";
import { StorageComponent } from "./components/storage";
import { WiredPinsComponent } from "./components/wired_pins";
import { BeltUnderlaysComponent } from "./components/belt_underlays";
import { WireComponent } from "./components/wire";
import { ConstantSignalComponent } from "./components/constant_signal";
import { LogicGateComponent } from "./components/logic_gate";
import { LeverComponent } from "./components/lever";
import { WireTunnelComponent } from "./components/wire_tunnel";
import { DisplayComponent } from "./components/display";
import { BeltReaderComponent } from "./components/belt_reader";
import { FilterComponent } from "./components/filter";
import { ItemProducerComponent } from "./components/item_producer";
import { DynamicMapEntityComponent } from "./components/dynamic_map_entity";
import { ResourceComponent } from "./components/resource";
import { PlayerComponent } from "./components/player";
import { BarracksComponent } from "./components/barracks";
import { CombatComponent } from "./components/combat";

export function initComponentRegistry() {
    gComponentRegistry.register(StaticMapEntityComponent);
    gComponentRegistry.register(BeltComponent);
    gComponentRegistry.register(ItemEjectorComponent);
    gComponentRegistry.register(ItemAcceptorComponent);
    gComponentRegistry.register(MinerComponent);
    gComponentRegistry.register(BarracksComponent);
    gComponentRegistry.register(ItemProcessorComponent);
    gComponentRegistry.register(UndergroundBeltComponent);
    gComponentRegistry.register(HubComponent);
    gComponentRegistry.register(StorageComponent);
    gComponentRegistry.register(WiredPinsComponent);
    gComponentRegistry.register(BeltUnderlaysComponent);
    gComponentRegistry.register(WireComponent);
    gComponentRegistry.register(ConstantSignalComponent);
    gComponentRegistry.register(LogicGateComponent);
    gComponentRegistry.register(LeverComponent);
    gComponentRegistry.register(WireTunnelComponent);
    gComponentRegistry.register(DisplayComponent);
    gComponentRegistry.register(BeltReaderComponent);
    gComponentRegistry.register(FilterComponent);
    gComponentRegistry.register(ItemProducerComponent);
    gComponentRegistry.register(ResourceComponent);
    gComponentRegistry.register(DynamicMapEntityComponent);
    gComponentRegistry.register(PlayerComponent);
    gComponentRegistry.register(CombatComponent);

    // IMPORTANT ^^^^^ UPDATE ENTITY COMPONENT STORAGE AFTERWARDS

    // Sanity check - If this is thrown, you (=me, lol) forgot to add a new component here

    assert(
        // @ts-ignore
        require.context("./components", false, /.*\.js/i).keys().length ===
            gComponentRegistry.getNumEntries(),
        "Not all components are registered"
    );

    console.log("📦 There are", gComponentRegistry.getNumEntries(), "components");
}
