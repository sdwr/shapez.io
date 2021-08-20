import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { Component } from "../component";
import { Entity } from "../entity";
import { typeItemSingleton } from "../item_resolver";

export class PlayerComponent extends Component {
    static getId() {
        return "Player";
    }

    static getSchema() {
        return {};
    }

    constructor() {
        super();
    }
}
