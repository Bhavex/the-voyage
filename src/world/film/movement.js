import { WALK_OBSTACLES } from './layout.js'

export function createCaptain() {
  return { x: 0, z: 38, heading: 0, speed: 0, moving: false, running: false }
}

export function walkable(x, z) {
  const insideIsland = (x / 30.5) ** 2 + (z / 23.5) ** 2 <= 1
  const onDock = Math.abs(x) <= 2.6 && z >= 18 && z <= 44
  if (!insideIsland && !onDock) return false
  return !WALK_OBSTACLES.some((b) => Math.abs(x - b.x) < b.width / 2 + 0.55 && Math.abs(z - b.z) < b.depth / 2 + 0.55)
}

export function stepCaptain(captain, keys, yaw, delta) {
  const dt = Math.min(delta, 0.05)
  let sideways = Number(keys.KeyD || false) - Number(keys.KeyA || false)
  let forward = Number(keys.KeyW || false) - Number(keys.KeyS || false)
  const length = Math.hypot(sideways, forward)
  captain.moving = length > 0
  captain.running = !!(keys.ShiftLeft || keys.ShiftRight)
  captain.speed = length ? (captain.running ? 7 : 3.8) : 0
  if (!length) return
  sideways /= length
  forward /= length
  const dx = (Math.cos(yaw) * sideways - Math.sin(yaw) * forward) * captain.speed * dt
  const dz = (-Math.sin(yaw) * sideways - Math.cos(yaw) * forward) * captain.speed * dt
  // Resolve each axis separately so the captain slides past corners.
  if (walkable(captain.x + dx, captain.z)) captain.x += dx
  if (walkable(captain.x, captain.z + dz)) captain.z += dz
  const desired = Math.atan2(-dx, -dz)
  const error = Math.atan2(Math.sin(desired - captain.heading), Math.cos(desired - captain.heading))
  captain.heading += error * (1 - Math.exp(-dt * 12))
}

export function nearestInteraction(captain, landmarks) {
  let result = null, best = Infinity
  for (const landmark of landmarks) {
    const distance = Math.hypot(captain.x - landmark.position[0], captain.z - landmark.position[2])
    if (distance < landmark.radius && distance < best) {
      result = landmark.id
      best = distance
    }
  }
  return result
}
