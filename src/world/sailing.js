import { ISLANDS } from '../config/islands.js'

export const SAIL_NAMES = ['Furled', 'Half', 'Full']
export const SAIL_SPEEDS = [0, 9, 18]
export const SEA_EDGE = 900
export const VISIBLE_ISLANDS = ISLANDS.filter((island) => island.status !== 'hidden')

export function createSailingState() {
  return {
    x: 0, z: 0, y: 0, heading: 0, speed: 0, steering: 0, sailLevel: 0,
    left: false, right: false, dragging: false, dragSteer: 0,
    dragStartX: 0, pointerId: null, returning: false,
  }
}

export function clearSailingInput(ship) {
  ship.left = ship.right = ship.dragging = false
  ship.dragSteer = 0
  ship.pointerId = null
}

export function changeSail(ship, direction) {
  ship.sailLevel = Math.max(0, Math.min(2, ship.sailLevel + direction))
}

export function angleDifference(target, current) {
  return Math.atan2(Math.sin(target - current), Math.cos(target - current))
}

// Mutable frame state keeps movement independent of React renders.
export function stepSailing(ship, delta) {
  // Returning from a background tab must never teleport the ship.
  const dt = Math.min(delta, 0.05)
  const radius = Math.hypot(ship.x, ship.z)
  if (radius > SEA_EDGE) ship.returning = true
  else if (radius < SEA_EDGE - 50) ship.returning = false

  const targetSpeed = SAIL_SPEEDS[ship.sailLevel]
  ship.speed += (targetSpeed - ship.speed) * (1 - Math.exp(-dt / 3))
  const input = ship.dragging ? ship.dragSteer : Number(ship.left) - Number(ship.right)
  ship.steering += (input - ship.steering) * (1 - Math.exp(-dt * 5))
  const turnRate = 0.55 * (0.12 + 0.88 * ship.speed / SAIL_SPEEDS[2])
  const edgeStrength = ship.returning ? Math.min(1, Math.max(0, (radius - 850) / 80)) : 0
  let turn = ship.steering * turnRate * (1 - edgeStrength)
  if (ship.returning) {
    const inward = Math.atan2(ship.x, ship.z)
    const error = angleDifference(inward, ship.heading)
    turn += Math.max(-turnRate, Math.min(turnRate, error * 1.5)) * edgeStrength
  }
  ship.heading = angleDifference(ship.heading + turn * dt, 0)
  ship.x -= Math.sin(ship.heading) * ship.speed * dt
  ship.z -= Math.cos(ship.heading) * ship.speed * dt
}

export function nearbyIsland(ship) {
  let nearest = null
  let distance = 120
  for (const island of VISIBLE_ISLANDS) {
    const d = Math.hypot(ship.x - island.position[0], ship.z - island.position[1])
    if (d < distance) {
      distance = d
      nearest = island
    }
  }
  return nearest?.name ?? ''
}

// Rotate a hull-local sample into world space before reading the water.
export function hullWaveHeight(waveHeight, ship, localX, localZ, time) {
  const sin = Math.sin(ship.heading)
  const cos = Math.cos(ship.heading)
  return waveHeight(
    ship.x + localX * cos + localZ * sin,
    ship.z - localX * sin + localZ * cos,
    time,
  )
}

export function oceanGridPosition(position, size, segments) {
  // Eight whole mesh cells: snapping preserves both wave phase and vertex lattice.
  const grid = (size / segments) * 8
  return Math.round(position / grid) * grid
}
