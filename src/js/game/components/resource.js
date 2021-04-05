import { types } from "../../savegame/serialization";
import { Component } from "../component";

export class ResourceComponent extends Component {
    static getId() {
        return "Resource";
    }

    static getSchema() {
        return {};
    }
}
