import { Vector } from "../../core/vector";
import { types } from "../../savegame/serialization";
import { Component } from "../component";

export class DynamicMapEntityComponent extends Component {
    static getId() {
        return "DynamicMapEntity";
    }

    static getSchema() {
        // cachedMinedItem is not serialized.
        return {
            origin: types.tileVector,
            tileSize: types.vector,
            speed: types.uint,
            destination: types.vector,
            rotation: types.float,
        };
    }

    /**
     *
     * @param {object} param0
     * @param {Vector=} param0.origin Origin (Top Left corner) of the entity
     * @param {Vector=} param0.tileSize Size of the entity in tiles
     * @param {number=} param0.speed Speed of the entity in tiles/s
     * @param {Vector=} param0.destination Destination tile
     * @param {number=} param0.rotation Rotation in degrees. Must be multiple of 90
     */
    constructor({
        origin = new Vector(),
        tileSize = new Vector(0.3, 0.3),
        speed = 1,
        destination = new Vector(),
        rotation = 0,
    }) {
        super();
        this.origin = origin;
        this.tileSize = tileSize;
        this.speed = speed;
        this.destination = destination;
        this.rotation = rotation;
    }

    //careful of origin vs center
    // origin of entities is top left corner
    updatePosition(elapsedMs) {
        // let centerOffset = this.tileSize.divideScalar(2);
        // let center = this.origin.add(centerOffset);
        let dist = this.destination.sub(this.origin);
        let distScalar = dist.length();

        let distanceTraveled = this.speed * elapsedMs;
        if (distanceTraveled >= distScalar) {
            this.origin = this.destination;
        } else {
            let fractionTraveled = distanceTraveled / distScalar;
            this.origin.addInplace(dist.multiplyScalar(fractionTraveled));
        }
    }

    /**
     *
     * @param {Vector=} destination
     */
    updateDestination(destination) {
        this.destination = destination;
        this.rotation = Math.round(Math.degrees(destination.sub(this.origin).angle()));
    }
}
