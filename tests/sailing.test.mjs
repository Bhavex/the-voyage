import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createSailingState, stepSailing, changeSail, clearSailingInput,
  hullWaveHeight, nearbyIsland, oceanGridPosition, VISIBLE_ISLANDS,
} from '../src/world/sailing.js'
import { waveHeight } from '../src/world/waves.js'

function advance(ship, seconds, fps = 60) {
  for (let i = 0; i < seconds * fps; i++) stepSailing(ship, 1 / fps)
}

test('three sail levels build speed gradually and coast to a stop', () => {
  const ship = createSailingState()
  changeSail(ship, -1)
  assert.equal(ship.sailLevel, 0)
  changeSail(ship, 1)
  advance(ship, 1)
  assert.ok(ship.speed > 0 && ship.speed < 9)
  changeSail(ship, 1)
  changeSail(ship, 1)
  assert.equal(ship.sailLevel, 2)
  advance(ship, 20)
  assert.ok(ship.speed > 17.9 && ship.speed <= 18)
  changeSail(ship, -1)
  advance(ship, 20)
  assert.ok(Math.abs(ship.speed - 9) < 0.02)
  changeSail(ship, -1)
  const before = ship.z
  advance(ship, 1)
  assert.ok(ship.speed > 0 && ship.z < before)
  advance(ship, 30)
  assert.ok(ship.speed < 0.001)
})

test('left/right and wheel drag steer correctly; low speed reduces turning', () => {
  const left = { ...createSailingState(), left: true, sailLevel: 2, speed: 18 }
  const right = { ...left, left: false, right: true }
  const slow = { ...createSailingState(), left: true }
  const drag = { ...createSailingState(), dragging: true, dragSteer: -1, sailLevel: 2, speed: 18 }
  for (const ship of [left, right, slow, drag]) advance(ship, 1)
  assert.ok(left.x < 0 && right.x > 0 && drag.x > 0)
  assert.ok(left.heading > slow.heading * 5)
  clearSailingInput(drag)
  assert.equal(drag.dragging, false)
  assert.equal(drag.dragSteer, 0)
})

test('sailing is consistent at 30/60/120 fps, and stalled frames cannot teleport', () => {
  const ships = [30, 60, 120].map((fps) => {
    const ship = { ...createSailingState(), sailLevel: 2, left: true }
    advance(ship, 8, fps)
    return ship
  })
  assert.ok(Math.hypot(ships[0].x - ships[2].x, ships[0].z - ships[2].z) < 1)
  const ship = { ...createSailingState(), speed: 18, sailLevel: 2 }
  stepSailing(ship, 60)
  assert.ok(Math.hypot(ship.x, ship.z) <= 0.91)
})

test('sea edge returns even a ship whose helm is held against it', () => {
  for (const heading of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    for (const input of [-1, 0, 1]) {
      const ship = { ...createSailingState(), heading, x: -Math.sin(heading) * 899,
        z: -Math.cos(heading) * 899, speed: 18, sailLevel: 2, left: input === 1, right: input === -1 }
      let maximum = 0, warned = false, returned = false
      for (let i = 0; i < 60 * 90; i++) {
        stepSailing(ship, 1 / 60)
        maximum = Math.max(maximum, Math.hypot(ship.x, ship.z))
        warned ||= ship.returning
        if (warned && Math.hypot(ship.x, ship.z) < 850) { returned = true; break }
      }
      assert.ok(warned && returned, `returns at heading ${heading}, input ${input}`)
      assert.ok(maximum < 1020, `bounded excursion: ${maximum}`)
    }
  }
})

test('wave samples follow the rotated hull at arbitrary world positions', () => {
  for (const heading of [0, Math.PI / 2, Math.PI, 1.17]) {
    const ship = { ...createSailingState(), x: 317, z: -235, heading }
    const actual = hullWaveHeight(waveHeight, ship, 0, -5, 12)
    const expected = waveHeight(317 - 5 * Math.sin(heading), -235 - 5 * Math.cos(heading), 12)
    assert.ok(Math.abs(actual - expected) < 1e-10)
  }
})

test('ocean snapping preserves the vertex lattice at both quality settings', () => {
  for (const segments of [192, 384]) {
    const cell = 1600 / segments
    for (const x of [-1000, -81, -1, 0, 25, 901]) {
      const snapped = oceanGridPosition(x, 1600, segments)
      assert.ok(Math.abs(snapped / cell - Math.round(snapped / cell)) < 1e-10)
      assert.ok(Math.abs(snapped - x) <= cell * 4 + 1e-10)
    }
  }
})

test('names appear within 120 units; hidden Sky Island is excluded', () => {
  assert.equal(VISIBLE_ISLANDS.length, 7)
  for (const island of VISIBLE_ISLANDS) {
    assert.equal(nearbyIsland({ x: island.position[0], z: island.position[1] }), island.name)
  }
  assert.equal(nearbyIsland({ x: 0, z: 101 }), 'Home Island')
  assert.equal(nearbyIsland({ x: 0, z: 99 }), '')
  assert.equal(nearbyIsland({ x: 0, z: -700 }), '')
})
