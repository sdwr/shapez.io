import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";

export class BarracksComponent extends Component {
    static getId() {
        return "Barracks";
    }

    static getSchema() {
        // cachedMinedItem is not serialized.
        return {
            lastMiningTime: types.ufloat,
            unitType: types.string,
            children: types.array(types.uint),
        };
    }

    constructor(unitType) {
        super();
        this.lastMiningTime = 0;

        this.unitType = unitType;

        this.children = [];
    }
}
