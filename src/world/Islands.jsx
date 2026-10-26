import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { OPEN_SEA } from '../config/palette'
import { VISIBLE_ISLANDS } from './sailing'
import { SHORELINES } from './shorelines'

// Smooth, gently irregular rock surfaces with shared geometry and three light bands.
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
    const colours = [OPEN_SEA.fog, OPEN_SEA.oceanDeep, OPEN_SEA.cloudShadow, OPEN_SEA.cloudLight, OPEN_SEA.oceanMid, OPEN_SEA.skyMid, OPEN_SEA.skyHorizon]
    const materials = colours.map((color) => new THREE.MeshToonMaterial({ color, gradientMap: gradient }))
    return { geometry, gradient, materials }
  }, [])

  useEffect(() => () => {
    resources.geometry.dispose()
    resources.gradient.dispose()
    resources.materials.forEach((material) => material.dispose())
  }, [resources])

  return (
    <group name="islands" dispose={null}>
      {VISIBLE_ISLANDS.map((island, index) => (
        <group key={island.id} name={`island_${island.id}`} position={[island.position[0], 0, island.position[1]]} rotation-y={SHORELINES[index].angle}>
          <mesh geometry={resources.geometry} material={resources.materials[index]} position={[0, -2, 0]} scale={[32, 9, 25]} />
          <mesh geometry={resources.geometry} material={resources.materials[index]} position={[-8, 7, -3]} scale={[18, 19 + index % 3 * 4, 16]} rotation-z={0.14} />
          <mesh geometry={resources.geometry} material={resources.materials[index]} position={[11, 5, 2]} scale={[15, 14, 13]} rotation-z={-0.2} />
          <mesh geometry={resources.geometry} material={resources.materials[index]} position={[1, 9, -10]} scale={[11, 22, 10]} />
        </group>
      ))}
    </group>
  )
}
