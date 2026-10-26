import * as THREE from 'three'
import { OPEN_SEA, ISLAND_PALETTES } from '../config/palette.js'
import { VISIBLE_ISLANDS } from './sailing.js'

// Sea, sky, fog and light colours for the current ship position: the open-sea palette, pulled toward
// the palette of every island the ship is near. Ocean, Sky, Atmosphere and the lights read `atmosphere`.
export const BLEND_FAR = 280 // an island starts to tint the sea from this distance...
export const BLEND_NEAR = 90 // ...and owns it completely from here (the fly-in starts at 100)

export const COLOUR_KEYS = [
  'skyZenith', 'skyMid', 'skyHorizon', 'sun', 'cloudLight', 'cloudShadow',
  'oceanDeep', 'oceanMid', 'oceanShallow', 'foam', 'fog',
]
export const VALUE_KEYS = ['fogScale', 'light']

const smooth = (t) => t * t * (3 - 2 * t)

// How strongly each island pulls the look. Easing in keeps the sea at the start (home is ~220 away)
// almost untouched, and the weights are continuous so nothing pops when another island becomes nearest.
export function islandWeights(x, z) {
  return VISIBLE_ISLANDS
    .filter((island) => ISLAND_PALETTES[island.id])
    .map((island) => {
      const d = Math.hypot(x - island.position[0], z - island.position[1])
      const t = THREE.MathUtils.clamp((BLEND_FAR - d) / (BLEND_FAR - BLEND_NEAR), 0, 1)
      return { id: island.id, weight: smooth(t) ** 2 }
    })
}

export function createAtmosphere() {
  const state = { colours: {}, sunDir: new THREE.Vector3(), fogScale: 1, light: 1, dominant: null }
  COLOUR_KEYS.forEach((key) => { state.colours[key] = new THREE.Color(OPEN_SEA[key]) })
  state.sunDir.set(...OPEN_SEA.sunDir).normalize()
  return state
}

const palettes = {}
const colourOf = (id, key) => (palettes[`${id}.${key}`] ??= new THREE.Color(ISLAND_PALETTES[id][key]))
const openColours = {}
const openColour = (key) => (openColours[key] ??= new THREE.Color(OPEN_SEA[key]))
const scratch = new THREE.Vector3()
const tint = new THREE.Color()

export function blendAtmosphere(state, x, z) {
  const weights = islandWeights(x, z).filter((entry) => entry.weight > 0.0005)
  const total = weights.reduce((sum, entry) => sum + entry.weight, 0)
  // A true weighted average: the open sea keeps whatever share the islands leave. Between two islands
  // they split the pull instead of stacking, so the result never depends on their order.
  const scale = total > 1 ? 1 / total : 1
  const open = 1 - Math.min(1, total)
  for (const key of COLOUR_KEYS) state.colours[key].copy(openColour(key)).multiplyScalar(open)
  state.sunDir.set(...OPEN_SEA.sunDir).normalize().multiplyScalar(open)
  state.fogScale = open
  state.light = open
  state.dominant = null
  let best = 0
  for (const { id, weight } of weights) {
    const w = weight * scale
    const palette = ISLAND_PALETTES[id]
    for (const key of COLOUR_KEYS) state.colours[key].add(tint.copy(colourOf(id, key)).multiplyScalar(w))
    state.sunDir.add(scratch.set(...palette.sunDir).normalize().multiplyScalar(w))
    state.fogScale += palette.fogScale * w
    state.light += palette.light * w
    if (weight > best) { best = weight; state.dominant = id }
  }
  state.sunDir.normalize()
  return state
}

// Single shared instance, updated once per frame by <Atmosphere />.
export const atmosphere = createAtmosphere()
