// Shared Gerstner wave settings.
// The ocean shader and the ship both read these, so the ship always rides
// the exact waves you see. Change waves here only.

export const WAVES = [
  // dirX, dirZ, steepness (0-1), wavelength (world units)
  { dir: [1.0, 0.35], steepness: 0.22, wavelength: 38 },
  { dir: [0.6, 1.0], steepness: 0.18, wavelength: 22 },
  { dir: [-0.4, 0.9], steepness: 0.14, wavelength: 13 },
  { dir: [0.9, -0.5], steepness: 0.1, wavelength: 7 },
]

const G = 9.8

function norm([x, z]) {
  const l = Math.hypot(x, z)
  return [x / l, z / l]
}

// Wave height (y) at a world position and time.
// Ignores the small sideways drift of Gerstner waves, which is fine for floating objects.
export function waveHeight(x, z, t) {
  let y = 0
  for (const w of WAVES) {
    const [dx, dz] = norm(w.dir)
    const k = (2 * Math.PI) / w.wavelength
    const c = Math.sqrt(G / k)
    const f = k * (dx * x + dz * z - c * t)
    y += (w.steepness / k) * Math.sin(f)
  }
  return y
}

// Packs the waves into vec4s for the shader: (dirX, dirZ, steepness, wavelength)
export function wavesAsVec4() {
  return WAVES.map((w) => {
    const [dx, dz] = norm(w.dir)
    return [dx, dz, w.steepness, w.wavelength]
  })
}
