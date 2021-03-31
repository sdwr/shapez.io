import { BasicSerializableObject, types } from "../savegame/serialization";
import { GameRoot } from "./root";

export class Resources extends BasicSerializableObject {
    static getId() {
        return "Resources";
    }

    static getSchema() {
        return {
            stone: types.uint,
            wood: types.uint,
            gold: types.uint,
        };
    }

    /**
     *
     * @param {*} data
     * @param {GameRoot} root
     */
    deserialize(data, root) {
        const errorCode = super.deserialize(data);
        if (errorCode) {
            return errorCode;
        }
    }

    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        super();

        this.root = root;

        this.stone = 0;
        this.wood = 0;
        this.gold = 100;
    }
}
