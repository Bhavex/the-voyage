import test from 'node:test'
import assert from 'node:assert/strict'
import { createCaptain, nearestInteraction, stepCaptain, walkable } from '../src/world/film/movement.js'
import { BUILDINGS, LANDMARKS } from '../src/world/film/layout.js'

test('captain can walk off the dock, but cannot step into the sea', () => {
  const captain = createCaptain()
  for (let i = 0; i < 300; i++) stepCaptain(captain, { KeyW: true }, 0, 1 / 60)
  assert.ok(captain.z < 23 && captain.z > 15)
  for (let i = 0; i < 2000; i++) stepCaptain(captain, { KeyD: true }, 0, 1 / 60)
  assert.ok(walkable(captain.x, captain.z))
  assert.ok(captain.x < 31)
  assert.equal(walkable(3.5, 38), false)
  assert.equal(walkable(0, 45), false)
})

test('every building blocks walking and diagonal movement does not run faster', () => {
  for (const b of BUILDINGS) {
    assert.equal(walkable(b.x, b.z), false)
    const captain = { ...createCaptain(), x: b.x, z: b.z + b.depth / 2 + 2 }
    for (let i = 0; i < 180; i++) stepCaptain(captain, { KeyW: true }, 0, 1 / 60)
    assert.ok(captain.z >= b.z + b.depth / 2 + 0.5)
  }
  const straight = { ...createCaptain(), z: 16 }, diagonal = { ...straight }, running = { ...straight }
  stepCaptain(straight, { KeyW: true }, 0, 0.05)
  stepCaptain(diagonal, { KeyW: true, KeyD: true }, 0, 0.05)
  stepCaptain(running, { KeyW: true, ShiftLeft: true }, 0, 0.05)
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.z - 16) - Math.abs(straight.z - 16)) < 1e-8)
  assert.ok(Math.abs(running.z - 16) > Math.abs(straight.z - 16))
})

test('all interactions are reachable from the dock without crossing an obstacle', () => {
  const queue = [[0, 38]], visited = new Set(['0,38']), reached = new Set()
  for (let i = 0; i < queue.length; i++) {
    const [x, z] = queue[i]
    const id = nearestInteraction({ x, z }, LANDMARKS)
    if (id) reached.add(id)
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${x + dx},${z + dz}`
      if (!visited.has(key) && walkable(x + dx, z + dz)) {
        visited.add(key)
        queue.push([x + dx, z + dz])
      }
    }
  }
  assert.deepEqual([...reached].sort(), LANDMARKS.map((item) => item.id).sort())
})
