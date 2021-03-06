/**
 * @typedef {import("../game/entity").Entity} Entity
 * @typedef {import("../game/map_chunk").MapChunk} MapChunk
 *
 * @typedef {{
 *   failedMam: boolean,
 *   trashedCount: number,
 *   usedInverseRotater: boolean
 * }} SavegameStats
 *
 * @typedef {{
 *   camera: any,
 *   time: any,
 *   entityMgr: any,
 *   map: any,
 *   hubGoals: any,
 *   pinnedShapes: any,
 *   waypoints: any,
 *   entities: Array<Entity>,
 *   chunks: Array<MapChunk>,
 *   beltPaths: Array<any>,
 *   resources: any,
 * }} SerializedGame
 *
 * @typedef {{
 *   version: number,
 *   dump: SerializedGame,
 *   stats: SavegameStats,
 *   lastUpdate: number,
 * }} SavegameData
 *
 * @typedef {{
 *   lastUpdate: number,
 *   version: number,
 *   internalId: string,
 *   level: number
 *   name: string|null
 * }} SavegameMetadata
 *
 * @typedef {{
 *   version: number,
 *   savegames: Array<SavegameMetadata>
 * }} SavegamesData
 */

export default {};
