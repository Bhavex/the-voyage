import { CAPTAIN_SPAWN, WALK_OBSTACLES } from './layout.js'

const FIXED_STEP = 1 / 120
export function createCaptain() {
  return { ...CAPTAIN_SPAWN, heading: 0, speed: 0, moving: false, running: false, accumulator: 0, moveX: 0, moveZ: -1 }
}

export function walkable(x, z) {
  const insideIsland = (x / 30.5) ** 2 + (z / 23.5) ** 2 <= 1
  const onDock = Math.abs(x) <= 2.6 && z >= 18 && z <= 44
  if (!insideIsland && !onDock) return false
  return !WALK_OBSTACLES.some((b) => Math.abs(x - b.x) < b.width / 2 + 0.55 && Math.abs(z - b.z) < b.depth / 2 + 0.55)
}

export function stepCaptain(captain, keys, yaw, delta) {
  const sideways = Number(keys.KeyD || false) - Number(keys.KeyA || false)
  const forward = Number(keys.KeyW || false) - Number(keys.KeyS || false)
  const length = Math.hypot(sideways, forward)
  captain.running = !!(keys.ShiftLeft || keys.ShiftRight)
  const maximum = captain.running ? 9 : 5.5
  const targetSpeed = length ? maximum : 0
  if (length) {
    captain.moveX = (Math.cos(yaw) * sideways - Math.sin(yaw) * forward) / length
    captain.moveZ = (-Math.sin(yaw) * sideways - Math.cos(yaw) * forward) / length
  }
  if (!length && captain.hadInput) captain.stopRate = captain.speed / 0.1
  captain.hadInput = length > 0
  captain.accumulator = (captain.accumulator ?? 0) + Math.max(0, Math.min(delta, 0.25))
  // Keep the same acceleration and collision steps at every rendering frame rate.
  while (captain.accumulator + 1e-9 >= FIXED_STEP) {
    captain.accumulator -= FIXED_STEP
    const oldSpeed = captain.speed
    const rate = targetSpeed ? maximum / 0.15 : (captain.stopRate || 55)
    const change = Math.min(Math.abs(targetSpeed - oldSpeed), rate * FIXED_STEP)
    captain.speed += Math.sign(targetSpeed - oldSpeed) * change
    const distance = (oldSpeed + captain.speed) * 0.5 * FIXED_STEP
    const dx = (captain.moveX ?? 0) * distance, dz = (captain.moveZ ?? -1) * distance
    if (walkable(captain.x + dx, captain.z)) captain.x += dx
    if (walkable(captain.x, captain.z + dz)) captain.z += dz
    if (length) {
      const desired = Math.atan2(-captain.moveX, -captain.moveZ)
      const error = Math.atan2(Math.sin(desired - captain.heading), Math.cos(desired - captain.heading))
      captain.heading += error * (1 - Math.exp(-FIXED_STEP * 12))
    }
  }
  captain.moving = captain.speed > 0.01
}

export function nearestInteraction(captain, landmarks) {
  let result = null, best = Infinity
  for (const landmark of landmarks) {
    const distance = Math.hypot(captain.x - landmark.position[0], captain.z - landmark.position[2])
    if (distance < landmark.radius && distance < best) { result = landmark.id; best = distance }
  }
  return result
}
