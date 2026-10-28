import * as THREE from 'three'
import { angleDifference } from '../sailing.js'
import { SHORELINES, shoreMeasure } from '../shorelines.js'
import { DOCK_CAMERA, DOCK_LOOK, DOCK_SHIP, FILM_ISLAND, ISLAND_HEART } from './layout.js'

// Pure helpers for the Film Island fly-in. Everything is in island-local coordinates (island centre at
// the origin, +Z toward the dock) unless a name says world. IslandDirector turns them into motion.

export const ORBIT_RADIUS = 76 // the ship circles the rock at this distance on its way to the dock
export const FLIGHT_MIN = 8
export const FLIGHT_MAX = 14
const FILM_SHORE = SHORELINES.find((shore) => shore.id === 'film')

const clamp01 = (t) => Math.min(1, Math.max(0, t))
export const smoothstep = (t) => { const x = clamp01(t); return x * x * (3 - 2 * x) }
export const smootherstep = (t) => { const x = clamp01(t); return x * x * x * (x * (x * 6 - 15) + 10) }
const lerp = THREE.MathUtils.lerp

// Control points for the ship's path: out of its own heading, around the rock on the shorter side at a
// safe distance, then straight along -Z into the berth, so it arrives bow-first at DOCK_SHIP.
export function approachPoints(start, heading = 0) {
  const berth = { x: DOCK_SHIP.x, z: DOCK_SHIP.z }
  const points = [{ x: start.x, z: start.z }]
  const r0 = Math.hypot(start.x, start.z)
  const a0 = Math.atan2(start.x, start.z)
  const endAngle = 0.18
  const sweep = angleDifference(endAngle, a0)
  if (Math.abs(sweep) > 0.6) {
    const steps = Math.max(2, Math.ceil(Math.abs(sweep) / 0.45))
    for (let i = 1; i <= steps; i++) {
      const f = i / steps
      const angle = a0 + sweep * f
      const radius = lerp(r0, ORBIT_RADIUS, smoothstep(f))
      points.push({ x: Math.sin(angle) * radius, z: Math.cos(angle) * radius })
    }
  }
  if (Math.hypot(points.at(-1).x - berth.x, points.at(-1).z - 58) > 6) points.push({ x: berth.x, z: 58 })
  points.push(berth)
  // Leave along the ship's own heading when that is roughly where the path goes; a ship pointing away
  // simply turns, instead of sailing out and doubling back.
  const next = points[1]
  const gap = Math.hypot(next.x - start.x, next.z - start.z)
  const facing = (-Math.sin(heading) * (next.x - start.x) + -Math.cos(heading) * (next.z - start.z)) / gap
  const reach = Math.min(14, gap * 0.4)
  const ahead = { x: start.x - Math.sin(heading) * reach, z: start.z - Math.cos(heading) * reach }
  if (facing > 0.5 && shoreMeasure(FILM_SHORE, FILM_ISLAND.position[0] + ahead.x, FILM_ISLAND.position[1] + ahead.z, 8) > 1) points.splice(1, 0, ahead)
  return points
}

export function createApproachCurve(points) {
  return new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.x, 0, p.z)), false, 'centripetal')
}

export function flightDuration(length) {
  return THREE.MathUtils.clamp(length / 17, FLIGHT_MIN, FLIGHT_MAX)
}

// Distance travelled at fraction `tau` of the flight. The ship leaves at its sailing speed and glides to
// a stop at the berth (cubic Hermite: start slope `startSlope`, zero slope at the end).
export function pathDistance(tau, length, startSlope) {
  const x = clamp01(tau)
  const m0 = Math.min(Math.max(startSlope, 0), 2.5 * length)
  return m0 * (x ** 3 - 2 * x ** 2 + x) + length * (3 * x ** 2 - 2 * x ** 3)
}

// Camera and look-at point (island-local) for the ship at `ship`, moving along unit vector `dir`.
// `u` is the fraction of the path done, `end` blends into the fixed docking shot, `wide` pulls back
// for tall, narrow screens. The camera trails the ship on the sea side with the island behind it.
export function flightShot(ship, dir, u, end, wide = 1) {
  const radius = Math.hypot(ship.x, ship.z) || 1
  const out = { x: ship.x / radius, z: ship.z / radius }
  const settle = smoothstep(u)
  const distance = lerp(40, 16, settle) * wide
  const behind = lerp(8, 4, u)
  const height = (lerp(14, 12.5, settle) - 3 * Math.sin(Math.PI * u)) * (1 + (wide - 1) * 0.25)
  const heart = 0.25 + 0.3 * Math.sin(Math.PI * u) // look further into the island mid-flight, but keep the ship in frame
  const cam = [
    ship.x + out.x * distance - dir.x * behind,
    height,
    ship.z + out.z * distance - dir.z * behind,
  ]
  const look = [
    lerp(ship.x + dir.x * 5, ISLAND_HEART[0], heart),
    lerp(4, ISLAND_HEART[1], heart),
    lerp(ship.z + dir.z * 5, ISLAND_HEART[2], heart),
  ]
  return {
    cam: cam.map((v, i) => lerp(v, DOCK_CAMERA[i], end)),
    look: look.map((v, i) => lerp(v, DOCK_LOOK[i], end)),
  }
}

// Critically damped spring (as in Unity's SmoothDamp). Velocity carries over, so a camera that was
// moving keeps moving smoothly when its target changes; `smoothTime` is roughly the time to arrive.
export function smoothDamp(current, target, velocity, smoothTime, dt) {
  const omega = 2 / Math.max(0.0001, smoothTime)
  const x = omega * dt
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  const change = current - target
  const temp = (velocity + omega * change) * dt
  return { value: target + (change + temp) * decay, velocity: (velocity - omega * temp) * decay }
}

export function smoothDampVector(current, target, velocity, smoothTime, dt) {
  for (const axis of ['x', 'y', 'z']) {
    const step = smoothDamp(current[axis], target[axis], velocity[axis], smoothTime, dt)
    current[axis] = step.value
    velocity[axis] = step.velocity
  }
}
