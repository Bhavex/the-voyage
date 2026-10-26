// Island list from docs/WORLD_BIBLE.md.
// Positions are rough placeholders on the sea (x, z) and will be tuned once
// the sea chart and sailing exist. Keep ids stable: other code uses them.

export const ISLANDS = [
  {
    id: 'film',
    name: 'Film Island',
    position: [180, -260],
    mood: 'Golden hour',
    landmark: 'Open-air cinema and lighthouse',
    status: 'prototype',
  },
  { id: 'forge', name: 'Forge Island', position: [-320, -180], mood: 'Volcanic dusk', landmark: 'Cliff forge', status: 'planned' },
  { id: 'editing', name: 'Editing Island', position: [-120, -460], mood: 'Neon night, rain', landmark: 'Monitor wall den', status: 'planned' },
  { id: 'port', name: "Builder's Port", position: [420, -40], mood: 'Bright midday', landmark: 'Harbour of project ships', status: 'planned' },
  { id: 'market', name: 'Market Isle', position: [360, -480], mood: 'Crisp morning', landmark: 'Merchant exchange', status: 'planned' },
  { id: 'uncharted', name: 'The Uncharted Zone', position: [-480, -520], mood: 'Fog and storm', landmark: 'Fog islands', status: 'planned' },
  { id: 'home', name: 'Home Island', position: [0, 220], mood: 'Blossom sunset', landmark: "Captain's cabin", status: 'planned' },
  { id: 'sky', name: 'Sky Island', position: [0, -700], mood: 'Hidden', landmark: 'Floating island', status: 'hidden' },
]
