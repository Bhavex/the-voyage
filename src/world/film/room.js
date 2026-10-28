import { GROUND_Y } from './layout.js'

// The door leads to a small interior set. Captain coordinates stay island-local.
export const ROOM = { x: 80, z: 0, halfWidth: 7, halfDepth: 6 }
export const ROOM_SPAWN = { x: ROOM.x, z: 0.8 }
export const ROOM_LANDMARKS = [
  { id: 'room-exit', position: [ROOM.x, GROUND_Y, 5], radius: 2.1 },
  { id: 'award', position: [ROOM.x + 5.6, GROUND_Y, 0], radius: 3 },
]
export function roomWalkable(x, z) {
  return Math.abs(x - ROOM.x) <= ROOM.halfWidth - 0.65 && Math.abs(z) <= ROOM.halfDepth - 0.65
}
// Frame slots fill the back (gallery) and left (certificates) walls, with extra rows as needed.
export function frameSlots(entries, kind) {
  const columns = kind === 'gallery' ? 3 : 2
  return entries.map((entry, index) => {
    const row = Math.floor(index / columns), col = index % columns
    return { ...entry, kind, position: kind === 'gallery'
      ? [ROOM.x - 4.4 + col * 4.4, GROUND_Y + 3.4 + row * 3.6, -5.72]
      : [ROOM.x - 6.72, GROUND_Y + 3.4 + row * 3.6, -2.5 + col * 5],
    rotation: kind === 'gallery' ? 0 : Math.PI / 2 }
  })
}
