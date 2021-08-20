import { BasicSerializableObject, types } from "../savegame/serialization";
import { GameRoot } from "./root";

import { ResourceItem } from "./items/resource_item";
import { enumResources } from "./resource_types";
import { BaseItem } from "./base_item";

export class Resources extends BasicSerializableObject {
    static getId() {
        return "Resources";
    }

    static getSchema() {
        return {
            resourceMap: types.keyValueMap(types.int),
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
        /**
         * Mapping from resource type to value
         * @type {Object<string, number>}
         */
        this.resourceMap = {};

        for (let i = 0; i < Object.keys(enumResources).length; i++) {
            let key = Object.values(enumResources)[i];
            this.resourceMap[key] = 0;
        }

        this.resourceMap["gold"] = 100;
    }

    getResourceAmountByKey(key) {
        return this.resourceMap[key];
    }

    hasEnoughResources(key, amount) {
        return this.resourceMap[key] >= amount;
    }

    /**
     *
     * @param {BaseItem} item
     */
    gainItem(item) {
        if (item.getItemType() == "resource") {
            this.gainResource(item.type, item.amount);
        }
    }

    gainResource(key, amount) {
        let savedAmount = this.getResourceAmountByKey(key);
        this.resourceMap[key] = savedAmount + amount;
        return true;
    }

    spendResources(key, amount) {
        if (this.hasEnoughResources(key, amount)) {
            let savedAmount = this.getResourceAmountByKey(key);
            this.resourceMap[key] = savedAmount - amount;
            return true;
        }
        return false;
    }
}
