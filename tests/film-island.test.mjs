import test from 'node:test'
import { canSkipArrival } from '../src/world/film/arrival.js'
import { filmObjective } from '../src/world/film/objectives.js'
import assert from 'node:assert/strict'
import { createCaptain, nearestInteraction, stepCaptain, walkable } from '../src/world/film/movement.js'
import { BUILDINGS, LANDMARKS, CAPTAIN_SPAWN } from '../src/world/film/layout.js'

test('captain can walk off the dock, but cannot step into the sea', () => {
  const captain = createCaptain()
  for (let i = 0; i < 300; i++) stepCaptain(captain, { KeyW: true }, 0, 1 / 60)
  assert.ok(captain.z < 23 && captain.z > 5)
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


test('fixed walking steps cover the same distance at 20 and 60 fps, including acceleration and stopping', () => {
  const simulate = (fps, running = false) => {
    const captain = createCaptain()
    for (let i = 0; i < fps; i++) stepCaptain(captain, { KeyW: true, ShiftLeft: running }, 0, 1 / fps)
    const travelled = CAPTAIN_SPAWN.z - captain.z
    assert.equal(captain.speed, running ? 9 : 5.5)
    for (let i = 0; i < fps / 5; i++) stepCaptain(captain, {}, 0, 1 / fps)
    assert.equal(captain.speed, 0)
    return [travelled, captain.z]
  }
  for (const running of [false, true]) {
    const a = simulate(20, running), b = simulate(60, running), slow = simulate(5, running)
    assert.ok(Math.abs(a[0] - b[0]) < 1e-8)
    assert.ok(Math.abs(a[1] - b[1]) < 1e-8)
    assert.ok(Math.abs(a[0] - slow[0]) < 1e-8)
  }
})

test('arrival ignores steering keys and guards deliberate skip keys for 1.5 seconds', () => {
  for (const code of ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
    for (const elapsed of [0, 1, 1.5, 5]) assert.equal(canSkipArrival(code, elapsed), false)
  }
  for (const code of ['Space', 'Enter', 'Escape']) {
    assert.equal(canSkipArrival(code, 1.49), false)
    assert.equal(canSkipArrival(code, 1.5), true)
    assert.equal(canSkipArrival(code, 4, true), false)
  }
})

test('spawn does not offer Set sail and objectives progress through the reel, film and lighthouse', () => {
  assert.equal(nearestInteraction(createCaptain(), LANDMARKS), null)
  assert.equal(filmObjective('rack', 'idle', false).text, 'Find the film reel')
  assert.equal(filmObjective('carrying', 'idle', false).text, 'Take the reel to the projector booth')
  assert.equal(filmObjective('loaded', 'playing', true).text, 'Watch The Director')
  assert.equal(filmObjective('loaded', 'stopped', true).text, 'Visit the lighthouse')
})
