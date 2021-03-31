import { BasicSerializableObject } from "../savegame/serialization";
import { GameRoot } from "./root";

export class Worlds extends BasicSerializableObject {
    static getID() {
        return "Worlds"
    }

    static getSchema() {
        return {

        }
    }

    /**
     *
     * @param {*} data
     * @param {GameRoot} root
     */
    deserialize(data, root) {

    }

    /**
     * @param {GameRoot} root
     */
     constructor(root) {
        super();

        this.root = root;
        this.worlds = [];

    }

    addWorld() {

    }
}