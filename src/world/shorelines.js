import { ISLANDS } from '../config/islands.js'

// The base rock is 32 × 25 units; its smooth bulge reaches about 35 × 28.
// Rotations match Islands.jsx. The extra room protects the bow and camera.
export const SHORELINES = ISLANDS
  .filter((island) => island.status !== 'hidden')
  .map((island, index) => ({
    id: island.id,
    x: island.position[0],
    z: island.position[1],
    angle: index * 0.8,
    cos: Math.cos(index * 0.8),
    sin: Math.sin(index * 0.8),
    rockX: 35,
    rockZ: 28,
  }))

export function localShorePoint(shore, x, z) {
  const dx = x - shore.x
  const dz = z - shore.z
  return {
    x: shore.cos * dx - shore.sin * dz,
    z: shore.sin * dx + shore.cos * dz,
  }
}

export function shoreMeasure(shore, x, z, margin = 0) {
  const local = localShorePoint(shore, x, z)
  const rx = shore.rockX + margin
  const rz = shore.rockZ + margin
  return (local.x / rx) ** 2 + (local.z / rz) ** 2
}

// First point where a world-space line enters an island's enlarged shoreline.
export function shoreEntry(shore, fromX, fromZ, toX, toZ, margin = 0) {
  const a = localShorePoint(shore, fromX, fromZ)
  const b = localShorePoint(shore, toX, toZ)
  const dx = b.x - a.x
  const dz = b.z - a.z
  const rx = shore.rockX + margin
  const rz = shore.rockZ + margin
  const A = (dx / rx) ** 2 + (dz / rz) ** 2
  if (A < 1e-12) return null
  const B = 2 * (a.x * dx / (rx * rx) + a.z * dz / (rz * rz))
  const C = (a.x / rx) ** 2 + (a.z / rz) ** 2 - 1
  if (C < 0) return 0
  const discriminant = B * B - 4 * A * C
  if (discriminant < 0) return null
  const entry = (-B - Math.sqrt(discriminant)) / (2 * A)
  return entry >= 0 && entry <= 1 ? entry : null
}

export function canLeaveShore(ship) {
  if (!ship.groundedShore) return true
  const shore = ship.groundedShore
  const local = localShorePoint(shore, ship.x, ship.z)
  const nx = local.x / (shore.rockX + 6.5) ** 2
  const nz = local.z / (shore.rockZ + 6.5) ** 2
  const forwardX = -Math.sin(ship.heading)
  const forwardZ = -Math.cos(ship.heading)
  const localForwardX = shore.cos * forwardX - shore.sin * forwardZ
  const localForwardZ = shore.sin * forwardX + shore.cos * forwardZ
  return (nx * localForwardX + nz * localForwardZ) / Math.hypot(nx, nz) > 0.08
}

export function moveShipAgainstShore(ship, nextX, nextZ) {
  let limit = 1
  let hitShore = null
  for (const shore of SHORELINES) {
    const entry = shoreEntry(shore, ship.x, ship.z, nextX, nextZ, 6.5)
    if (entry !== null && entry <= limit) {
      limit = Math.max(0, entry - 0.001)
      hitShore = shore
    }
  }
  ship.x += (nextX - ship.x) * limit
  ship.z += (nextZ - ship.z) * limit
  ship.grounded = hitShore !== null
  ship.groundedShore = hitShore
  if (hitShore) {
    // Rounding near a tangent can leave the centre a hair inside the ellipse.
    const local = localShorePoint(hitShore, ship.x, ship.z)
    const rx = hitShore.rockX + 6.5
    const rz = hitShore.rockZ + 6.5
    const measure = (local.x / rx) ** 2 + (local.z / rz) ** 2
    if (measure < 1.0005) {
      const scale = Math.sqrt(1.0005 / measure)
      const x = local.x * scale, z = local.z * scale
      ship.x = hitShore.x + hitShore.cos * x + hitShore.sin * z
      ship.z = hitShore.z - hitShore.sin * x + hitShore.cos * z
    }
    ship.speed *= 0.16
  } else {
    // Keep a ship pressed against the beach at rest while its sail stays raised.
    for (const shore of SHORELINES) {
      if (shoreMeasure(shore, ship.x, ship.z, 6.5) > 1.01) continue
      ship.groundedShore = shore
      if (!canLeaveShore(ship)) {
        ship.grounded = true
        ship.speed *= 0.8
        break
      }
      ship.groundedShore = null
    }
  }
}

export function cameraClearFraction(shipX, shipZ, cameraX, cameraZ) {
  const length = Math.hypot(cameraX - shipX, cameraZ - shipZ)
  if (length < 1e-6) return 1
  let fraction = 1
  for (const shore of SHORELINES) {
    const entry = shoreEntry(shore, shipX, shipZ, cameraX, cameraZ, 2)
    if (entry !== null) fraction = Math.min(fraction, Math.max(0, entry - 1.5 / length))
  }
  return fraction
}
