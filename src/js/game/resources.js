import { BasicSerializableObject, types } from "../savegame/serialization";
import { GameRoot } from "./root";

export class Resources extends BasicSerializableObject {
    static getId() {
        return "Resources";
    }

    static getSchema() {
        return {};
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

        this.resourceKeys = ["STONE", "WOOD", "GOLD"];
        this.resourceMap = new Map();
        for (let i = 0; i < this.resourceKeys.length; i++) {
            let key = this.resourceKeys[i];
            this.resourceMap.set(key, { amount: 0 });
        }

        this.resourceMap.set("GOLD", { amount: 100 });
    }

    getResourceAmountByKey(key) {
        return this.resourceMap.get(key).amount;
    }

    hasEnoughResources(key, amount) {
        return this.resourceMap.get(key).amount >= amount;
    }

    spendResources(key, amount) {
        if (this.hasEnoughResources(key, amount)) {
            let savedAmount = this.getResourceAmountByKey(key);
            this.resourceMap.set(key, { amount: savedAmount - amount });
        }
    }
}
