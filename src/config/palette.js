// Open-sea palette (see docs/WORLD_BIBLE.md, "Art direction").
// Each island will get its own palette object later with the same keys.

export const OPEN_SEA = {
  skyZenith: '#3f86c9',
  skyMid: '#8cc4e8',
  skyHorizon: '#fbe9cf',
  sun: '#fff4d6',
  sunDir: [0.55, 0.32, -0.77], // low dawn sun, ahead and to the right
  cloudLight: '#fff8ee',
  cloudShadow: '#c9b8d6',
  oceanDeep: '#0d4f63',
  oceanMid: '#1f8a8f',
  oceanShallow: '#5fc7bd',
  foam: '#f6fbf7',
  fog: '#f3dfc6',
}

// One palette per island, same keys as OPEN_SEA, so the sea, sky, fog and light can blend toward the
// nearest island (see src/world/lookBlend.js). `fogScale` stretches the haze distance (below 1 is
// thicker) and `light` scales the scene lights. `land` colours the island rock: the low shore, the
// hills and the highest peak. Land is chosen to stand apart from its own sea and horizon.
// Moods follow src/config/islands.js; the hidden Sky Island has none yet.
export const ISLAND_PALETTES = {
  film: {
    skyZenith: '#7a5a96',
    skyMid: '#f0a46c',
    skyHorizon: '#ffd79b',
    sun: '#fff0c2',
    sunDir: [-0.62, 0.17, -0.77], // golden hour, low and from the left
    cloudLight: '#ffe0b4',
    cloudShadow: '#b25a7c',
    oceanDeep: '#244e62',
    oceanMid: '#3d8a86',
    oceanShallow: '#f0c077',
    foam: '#fff4dc',
    fog: '#f6cf9c',
    fogScale: 1,
    light: 1,
    land: {
      shore: '#e2b97f', hill: '#5a7036', hillHigh: '#b6502e',
      sand: '#e2b97f', grass: '#8db86b', path: '#cfae86', walls: '#f1e6d6',
      terracotta: '#c4683f', teal: '#3f7f86', wood: '#8a5b3c', trim: '#203b45', accent: '#f2a93b',
    },
  },
  forge: {
    skyZenith: '#2a1f3d',
    skyMid: '#8a3f4a',
    skyHorizon: '#f08a4a',
    sun: '#ff9a50',
    sunDir: [0.22, 0.1, -0.97], // sinking behind the cliff
    cloudLight: '#e8744a',
    cloudShadow: '#3a2a45',
    oceanDeep: '#161a28',
    oceanMid: '#34364a',
    oceanShallow: '#c8582c',
    foam: '#f6c89c',
    fog: '#7c4448',
    fogScale: 0.8,
    light: 0.85,
    land: { shore: '#8c7a6a', hill: '#4c3a3c', hillHigh: '#e0702f' },
  },
  editing: {
    skyZenith: '#0e1030',
    skyMid: '#2c2c70',
    skyHorizon: '#6c3c8c',
    sun: '#bfeaff', // a cold neon moon
    sunDir: [-0.42, 0.48, -0.77],
    cloudLight: '#5a5ab4',
    cloudShadow: '#181840',
    oceanDeep: '#0b0f2e',
    oceanMid: '#1c3878',
    oceanShallow: '#2fd0e0',
    foam: '#b8f6ff',
    fog: '#382a68',
    fogScale: 0.75,
    light: 0.7,
    land: { shore: '#9a86c8', hill: '#d85ab4', hillHigh: '#5ae6f0' },
  },
  port: {
    skyZenith: '#2f7fd0',
    skyMid: '#80c2f0',
    skyHorizon: '#eaf6ff',
    sun: '#fffbe0',
    sunDir: [0.18, 0.85, -0.5], // high midday sun
    cloudLight: '#ffffff',
    cloudShadow: '#b4c6e2',
    oceanDeep: '#0a4a7c',
    oceanMid: '#1f9cc2',
    oceanShallow: '#80e2de',
    foam: '#ffffff',
    fog: '#dcf0fa',
    fogScale: 1.1,
    light: 1.05,
    land: { shore: '#f2e6c8', hill: '#2c4a7c', hillHigh: '#f0c534' },
  },
  market: {
    skyZenith: '#5aa6c2',
    skyMid: '#b6e0d0',
    skyHorizon: '#fff4de',
    sun: '#fffae0',
    sunDir: [-0.7, 0.32, -0.64], // clear low morning sun
    cloudLight: '#fffdf4',
    cloudShadow: '#a4c2be',
    oceanDeep: '#0e4a44',
    oceanMid: '#2a8a68',
    oceanShallow: '#8ed8a6',
    foam: '#fffaf0',
    fog: '#eef0da',
    fogScale: 1,
    light: 1,
    land: { shore: '#eadfbc', hill: '#b4842c', hillHigh: '#e4c04c' },
  },
  uncharted: {
    skyZenith: '#363a56',
    skyMid: '#6c7a82',
    skyHorizon: '#a8b4a8',
    sun: '#c8d4c2',
    sunDir: [0, 0.2, -1],
    cloudLight: '#8a96a2',
    cloudShadow: '#46405e',
    oceanDeep: '#16262a',
    oceanMid: '#385458',
    oceanShallow: '#6a8c82',
    foam: '#c8d4cc',
    fog: '#94a09a',
    fogScale: 0.5, // thick fog: islands show up only as they get close
    light: 0.7,
    land: { shore: '#7a7c72', hill: '#2c2842', hillHigh: '#7a62a8' },
  },
  home: {
    skyZenith: '#7a5a9c',
    skyMid: '#e898a8',
    skyHorizon: '#ffd2aa',
    sun: '#ffd8b0',
    sunDir: [0.5, 0.12, -0.86], // soft sunset
    cloudLight: '#ffd2c8',
    cloudShadow: '#a8668a',
    oceanDeep: '#27486c',
    oceanMid: '#4a8c9c',
    oceanShallow: '#f2a890',
    foam: '#fff0e8',
    fog: '#efbea8',
    fogScale: 1,
    light: 0.95,
    land: { shore: '#f4d4b2', hill: '#7e5236', hillHigh: '#f08aa8' },
  },
}
