import test from 'node:test'
import assert from 'node:assert/strict'
import { createCaptain, stepCaptain, nearestInteraction } from '../src/world/film/movement.js'
import { ROOM, ROOM_SPAWN, ROOM_LANDMARKS, roomWalkable, frameSlots } from '../src/world/film/room.js'
import { LIGHTHOUSE } from '../src/config/lighthouse.js'
import { filmObjective } from '../src/world/film/objectives.js'

test('the trophy room allows walking, bounds all four walls and keeps its exit reachable', () => {
  for (const key of ['KeyW', 'KeyS', 'KeyA', 'KeyD']) {
    const captain = { ...createCaptain(), ...ROOM_SPAWN }
    for (let i = 0; i < 600; i++) stepCaptain(captain, { [key]: true, ShiftLeft: true }, 0, 1 / 60, roomWalkable)
    assert.ok(roomWalkable(captain.x, captain.z))
    assert.ok(Math.abs(captain.x - ROOM_SPAWN.x) + Math.abs(captain.z - ROOM_SPAWN.z) > 1)
  }
  assert.equal(nearestInteraction({ x: ROOM.x, z: 4.5 }, ROOM_LANDMARKS), 'room-exit')
  assert.equal(roomWalkable(ROOM.x + 7, 0), false)
  assert.equal(roomWalkable(ROOM.x, 6), false)
})

test('config entries create distinct wall frames and added photos get another row', () => {
  const ids = [...LIGHTHOUSE.certificates, ...LIGHTHOUSE.gallery].map((item) => item.id)
  assert.equal(new Set(ids).size, ids.length)
  const frames = frameSlots([...LIGHTHOUSE.gallery, { id: 'new-photo' }], 'gallery')
  assert.equal(frames.at(-1).id, 'new-photo')
  assert.ok(frames.at(-1).position[1] > frames[0].position[1])
  for (const kind of ['certificates', 'gallery']) {
    const slots = frameSlots(LIGHTHOUSE[kind], kind)
    assert.equal(new Set(slots.map((slot) => slot.position.join())).size, slots.length)
    assert.ok(slots.every((slot) => slot.kind === kind && slot.caption))
  }
})

test('pause stays on The Director objective; the end card and stopping lead to the lighthouse', () => {
  for (const state of ['loading', 'playing', 'paused', 'blocked', 'soon']) assert.equal(filmObjective('loaded', state, true).text, 'Watch The Director')
  for (const state of ['ended', 'stopped']) assert.equal(filmObjective('loaded', state, true).text, 'Visit the lighthouse')
})
