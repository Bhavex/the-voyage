import { ISLANDS } from '../../config/islands.js'

export const FILM_ISLAND = ISLANDS.find((island) => island.id === 'film')
export const GROUND_Y = 3.2
export const DOCK_SHIP = { x: 8, z: 40, heading: 0 }
export const CAPTAIN_SPAWN = { x: 0, z: 38 }
export const BUILDINGS = [
  { x: -21, z: -7, width: 8, depth: 8, height: 6, roof: 'oceanDeep' },
  { x: -19, z: 7, width: 8, depth: 7, height: 5, roof: 'cloudShadow' },
  { x: -9, z: -16, width: 7, depth: 7, height: 5.5, roof: 'oceanMid' },
  { x: 19, z: 10, width: 8, depth: 7, height: 6, roof: 'skyZenith' },
]
export const LANDMARKS = [
  { id: 'rack', target: 'reel', name: 'Film reels', action: 'Pick up', position: [-8, GROUND_Y, 8], radius: 3.4, camera: [-15, 9, 17] },
  { id: 'projector', target: 'projector', name: 'Open-air cinema', action: 'Play', position: [4, GROUND_Y, 1.5], radius: 3.5, camera: [4, 10, -0.5] },
  { id: 'lighthouse', target: 'lighthouse_door', name: 'Lighthouse', action: 'Read', position: [22, GROUND_Y, -3.5], radius: 3.8, camera: [33, 15, 7] },
  { id: 'dock', target: 'dock', name: 'The dock', action: 'Set sail', position: [0, GROUND_Y, 38], radius: 3.6, camera: [16, 12, 53] },
]

// Shared with the placeholder layout. Rectangles are local X/Z bounds.
export const WALK_OBSTACLES = [
  ...BUILDINGS.map((b) => ({ x: b.x, z: b.z, width: b.width, depth: b.depth })),
  { x: 22, z: -8, width: 6, depth: 6 },
  { x: -8, z: 8, width: 3.5, depth: 1.2 },
  { x: 4, z: -20, width: 15, depth: 1.2 },
  { x: 4, z: 4.8, width: 1.8, depth: 1.6 },
  { x: 0.6, z: 4.2, width: 0.5, depth: 4.8 },
  { x: 7.4, z: 4.2, width: 0.5, depth: 4.8 },
  { x: 4, z: 6.5, width: 7, depth: 0.5 },
  ...[-12, -8, -4].flatMap((z) => [-1, 9].map((x) => ({ x, z, width: 4.2, depth: 1.4 }))),
]

export function worldPosition(x, y, z) {
  return [FILM_ISLAND.position[0] + x, y, FILM_ISLAND.position[1] + z]
}
