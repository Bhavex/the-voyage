import test from 'node:test'
import assert from 'node:assert/strict'
import { approachPoints, createApproachCurve, flightDuration, flightShot, pathDistance, smoothDamp, FLIGHT_MAX, FLIGHT_MIN } from '../src/world/film/flight.js'
import { DOCK_CAMERA, DOCK_LOOK, DOCK_SHIP, FILM_ISLAND } from '../src/world/film/layout.js'
import { SHORELINES, shoreMeasure } from '../src/world/shorelines.js'

const shore = SHORELINES.find((s) => s.id === 'film')
const clearOfRock = (p, margin = 6.5) => shoreMeasure(shore, FILM_ISLAND.position[0] + p.x, FILM_ISLAND.position[1] + p.z, margin) > 0.97

function starts() {
  const list = []
  for (const radius of [45, 60, 80, 100, 160]) {
    for (let k = 0; k < 16; k++) {
      const angle = k * Math.PI / 8
      const x = Math.sin(angle) * radius, z = Math.cos(angle) * radius
      if (!clearOfRock({ x, z })) continue
      for (const turn of [0, 1.7, -1.7, 3]) list.push({ x, z, heading: Math.atan2(-(-x), -(-z)) + turn })
    }
  }
  return list
}

test('the ship path never crosses the rock and always ends at the berth, bow along -Z', () => {
  for (const start of starts()) {
    const curve = createApproachCurve(approachPoints(start, start.heading))
    for (let i = 0; i <= 200; i++) {
      const p = curve.getPointAt(i / 200)
      assert.ok(clearOfRock({ x: p.x, z: p.z }), `start ${JSON.stringify(start)} hits rock at ${i / 200}`)
    }
    const end = curve.getPointAt(1)
    assert.ok(Math.hypot(end.x - DOCK_SHIP.x, end.z - DOCK_SHIP.z) < 1e-6)
    const tangent = curve.getTangentAt(1)
    assert.ok(tangent.z < -0.99)
  }
})

test('the flight length scales with distance but stays between 8 and 14 seconds', () => {
  assert.equal(flightDuration(50), FLIGHT_MIN)
  assert.equal(flightDuration(5000), FLIGHT_MAX)
  assert.ok(flightDuration(200) > FLIGHT_MIN && flightDuration(200) < FLIGHT_MAX)
})

test('distance profile starts at the sailing speed, never goes backwards and stops dead at the berth', () => {
  const length = 220, slope = 18 * 12
  assert.equal(pathDistance(0, length, slope), 0)
  assert.ok(Math.abs(pathDistance(1, length, slope) - length) < 1e-9)
  let previous = 0
  for (let i = 1; i <= 400; i++) {
    const d = pathDistance(i / 400, length, slope)
    assert.ok(d >= previous - 1e-9)
    previous = d
  }
  assert.ok(Math.abs(pathDistance(1, length, slope) - pathDistance(0.9999, length, slope)) < 0.01)
  assert.ok(Math.abs((pathDistance(0.0001, length, slope) / 0.0001) - slope) < 1)
  assert.ok(pathDistance(0.5, 50, 1e6) <= 50 + 1e-9) // absurd start speeds are clamped
})

test('the camera never enters the rock or the water and lands exactly on the docking shot', () => {
  for (const start of starts()) {
    const curve = createApproachCurve(approachPoints(start, start.heading))
    for (let i = 0; i <= 100; i++) {
      const u = i / 100
      const p = curve.getPointAt(u)
      const t = curve.getTangentAt(u)
      const end = Math.max(0, (u - 0.7) / 0.3)
      for (const wide of [1, 1.8]) {
        const { cam, look } = flightShot({ x: p.x, z: p.z }, { x: t.x, z: t.z }, u, end * end * (3 - 2 * end), wide)
        assert.ok(cam.every(Number.isFinite) && look.every(Number.isFinite))
        assert.ok(cam[1] > 8, 'camera stays well above the waves')
        assert.ok(clearOfRock({ x: cam[0], z: cam[2] }, 2), `camera inside the island at u=${u} from ${JSON.stringify(start)}`)
      }
    }
  }
  const last = flightShot({ x: DOCK_SHIP.x, z: DOCK_SHIP.z }, { x: 0, z: -1 }, 1, 1)
  DOCK_CAMERA.forEach((v, i) => assert.ok(Math.abs(last.cam[i] - v) < 1e-9))
  DOCK_LOOK.forEach((v, i) => assert.ok(Math.abs(last.look[i] - v) < 1e-9))
})

test('camera motion has no jumps: a frame never moves it more than a ship length', () => {
  const start = { x: -70, z: -40, heading: 1.2 }
  const curve = createApproachCurve(approachPoints(start, start.heading))
  let previous = null
  for (let i = 0; i <= 1000; i++) {
    const u = i / 1000
    const p = curve.getPointAt(u), t = curve.getTangentAt(u)
    const end = Math.max(0, (u - 0.7) / 0.3)
    const { cam } = flightShot({ x: p.x, z: p.z }, { x: t.x, z: t.z }, u, end * end * (3 - 2 * end))
    if (previous) assert.ok(Math.hypot(cam[0] - previous[0], cam[2] - previous[2]) < curve.getLength() / 1000 * 4)
    previous = cam
  }
})

test('smoothDamp settles on the target without overshoot and keeps velocity continuous', () => {
  let value = 0, velocity = 0
  let maxStep = 0, last = 0
  for (let i = 0; i < 240; i++) {
    ;({ value, velocity } = smoothDamp(value, 10, velocity, 0.4, 1 / 60))
    assert.ok(value <= 10 + 1e-9)
    maxStep = Math.max(maxStep, Math.abs(value - last))
    last = value
  }
  assert.ok(Math.abs(value - 10) < 1e-3)
  const step = smoothDamp(0, 10, 0, 0.4, 1 / 60)
  assert.ok(step.value < 0.05, 'starts gently, no snap')
  const slow = smoothDamp(0, 10, 0, 0.4, 1 / 30), fast = smoothDamp(0, 10, 0, 0.4, 1 / 120)
  assert.ok(slow.value > fast.value)
})
