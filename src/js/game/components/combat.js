import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";
import { GameRoot } from "../root";

export class CombatComponent extends Component {
    static getId() {
        return "Combat";
    }

    static getSchema() {
        // cachedMinedItem is not serialized.
        return {
            hp: types.int,
            range: types.int,
            damage: types.int,
            atkspeed: types.int,
            atkcooldown: types.int,
            target: types.uint,
        };
    }

    constructor(hp = 10, range = 3, damage = 5, atkspeed = 2000, atkcooldown = 2000, target = 0) {
        super();
        this.hp = hp;
        this.range = range;
        this.damage = damage;
        this.atkspeed = atkspeed;
        this.atkcooldown = atkcooldown;
        this.target = target;
    }

    updateCooldown(elapsedMs) {
        if (this.atkcooldown > 0) {
            this.atkcooldown = this.atkcooldown - elapsedMs;
            this.atkcooldown = Math.round(Math.max(this.atkcooldown, 0));
        }
    }
}
