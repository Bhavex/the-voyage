import test from 'node:test'
import assert from 'node:assert/strict'
import { ISLANDS } from '../src/config/islands.js'
import { OPEN_SEA, ISLAND_PALETTES } from '../src/config/palette.js'
import { COLOUR_KEYS, blendAtmosphere, createAtmosphere, islandWeights } from '../src/world/lookBlend.js'

const hex = (color) => '#' + color.getHexString()
const luminance = (value) => {
  const n = parseInt(value.slice(1), 16)
  return [n >> 16 & 255, n >> 8 & 255, n & 255].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
}
const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
const shown = ISLANDS.filter((island) => island.status !== 'hidden')

test('every visible island has a palette with all open-sea keys plus land colours', () => {
  for (const island of shown) {
    const palette = ISLAND_PALETTES[island.id]
    assert.ok(palette, `${island.id} needs a palette`)
    for (const key of Object.keys(OPEN_SEA)) assert.ok(key in palette, `${island.id} is missing ${key}`)
    for (const key of ['fogScale', 'light']) assert.ok(palette[key] > 0)
    for (const key of ['shore', 'hill', 'hillHigh']) assert.match(palette.land[key], /^#[0-9a-f]{6}$/i)
  }
})

test('islands do not reuse the sea or sky colours and read against their own water and horizon', () => {
  for (const island of shown.filter((entry) => entry.id !== 'film')) {
    const { land, ...look } = ISLAND_PALETTES[island.id]
    const water = [look.oceanDeep, look.oceanMid, look.oceanShallow, look.foam, look.fog]
    const sky = [look.skyZenith, look.skyMid, look.skyHorizon, look.cloudLight, look.cloudShadow, look.sun]
    for (const colour of Object.values(land)) {
      for (const other of [...water, ...sky, ...COLOUR_KEYS.map((key) => OPEN_SEA[key])]) assert.notEqual(colour.toLowerCase(), other.toLowerCase())
    }
    assert.ok(contrast(land.shore, look.oceanMid) >= 1.8, `${island.id} shore vs sea`)
    assert.ok(contrast(land.hill, look.skyHorizon) >= 1.8, `${island.id} hills vs horizon`)
  }
})

test('each island has its own look', () => {
  const seen = new Set()
  for (const island of shown) {
    const key = [ISLAND_PALETTES[island.id].skyHorizon, ISLAND_PALETTES[island.id].oceanMid].join()
    assert.ok(!seen.has(key))
    seen.add(key)
  }
})

test('weights are zero far away, full at the island and shared smoothly between neighbours', () => {
  const [film] = shown
  assert.equal(islandWeights(0, 0).reduce((sum, entry) => Math.max(sum, entry.weight), 0) < 0.08, true) // the opening sea
  const at = islandWeights(film.position[0], film.position[1]).find((entry) => entry.id === film.id)
  assert.equal(at.weight, 1)
  let previous = null
  for (let x = 0; x <= 400; x += 1) {
    const weights = islandWeights(x, -200).map((entry) => entry.weight)
    if (previous) weights.forEach((w, i) => assert.ok(Math.abs(w - previous[i]) < 0.08))
    previous = weights
  }
})

test('open sea at the start, the island palette at the island, continuous in between', () => {
  const state = createAtmosphere()
  blendAtmosphere(state, 0, 0)
  for (const key of ['oceanMid', 'skyHorizon', 'fog']) {
    const target = OPEN_SEA[key]
    const drift = contrast(hex(state.colours[key]), target)
    assert.ok(drift < 1.25, `${key} drifted too far at the start (${drift})`)
  }
  for (const island of shown) {
    blendAtmosphere(state, island.position[0], island.position[1] + 60)
    assert.equal(state.dominant, island.id)
    assert.equal(hex(state.colours.oceanMid), ISLAND_PALETTES[island.id].oceanMid.toLowerCase())
    assert.ok(Math.abs(state.sunDir.length() - 1) < 1e-9)
  }
  const previous = createAtmosphere()
  blendAtmosphere(previous, 180, -60)
  for (let step = 1; step <= 400; step++) {
    blendAtmosphere(state, 180, -60 - step)
    for (const key of COLOUR_KEYS) assert.ok(Math.abs(state.colours[key].r - previous.colours[key].r) < 0.05)
    COLOUR_KEYS.forEach((key) => previous.colours[key].copy(state.colours[key]))
  }
})

test('the thick fog of the Uncharted Zone shortens the haze distance', () => {
  const state = createAtmosphere()
  const island = ISLANDS.find((entry) => entry.id === 'uncharted')
  blendAtmosphere(state, island.position[0], island.position[1] + 90)
  assert.ok(state.fogScale < 0.6)
  assert.ok(state.light < 0.8)
})
