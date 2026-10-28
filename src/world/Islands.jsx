import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { ISLAND_PALETTES } from '../config/palette'
import { VISIBLE_ISLANDS } from './sailing'
import { SHORELINES } from './shorelines'

// Smooth, gently irregular rock surfaces with shared geometry and three light bands. Each island is
// painted from its own palette (shore, hills, highest peak) so it reads clearly against its sea and sky.
export default function Islands() {
  const resources = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 32, 24)
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i)
      const bulge = 1 + 0.09 * Math.sin(x * 5 + y * 3) * Math.cos(z * 4 - y * 2)
      positions.setXYZ(i, x * bulge, y * bulge, z * bulge)
    }
    geometry.computeVertexNormals()
    const gradient = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat)
    gradient.minFilter = gradient.magFilter = THREE.NearestFilter
    gradient.needsUpdate = true
    const toon = (color) => new THREE.MeshToonMaterial({ color, gradientMap: gradient })
    const materials = Object.fromEntries(VISIBLE_ISLANDS.filter((island) => island.id !== 'film').map((island) => {
      const { shore, hill, hillHigh } = ISLAND_PALETTES[island.id].land
      return [island.id, { shore: toon(shore), hill: toon(hill), peak: toon(hillHigh) }]
    }))
    return { geometry, gradient, materials }
  }, [])

  useEffect(() => () => {
    resources.geometry.dispose()
    resources.gradient.dispose()
    Object.values(resources.materials).forEach((set) => Object.values(set).forEach((material) => material.dispose()))
  }, [resources])

  return (
    <group name="islands" dispose={null}>
      {VISIBLE_ISLANDS.map((island, index) => island.id === 'film' ? null : (
        <group key={island.id} name={`island_${island.id}`} position={[island.position[0], 0, island.position[1]]} rotation-y={SHORELINES[index].angle}>
          <mesh geometry={resources.geometry} material={resources.materials[island.id].shore} position={[0, -2, 0]} scale={[32, 9, 25]} />
          <mesh geometry={resources.geometry} material={resources.materials[island.id].hill} position={[-8, 7, -3]} scale={[18, 19 + index % 3 * 4, 16]} rotation-z={0.14} />
          <mesh geometry={resources.geometry} material={resources.materials[island.id].hill} position={[11, 5, 2]} scale={[15, 14, 13]} rotation-z={-0.2} />
          <mesh geometry={resources.geometry} material={resources.materials[island.id].peak} position={[1, 9, -10]} scale={[11, 22, 10]} />
        </group>
      ))}
    </group>
  )
}
