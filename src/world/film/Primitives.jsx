import { useMemo } from 'react'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export function Block({ material, ...props }) {
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.08), [])
  return <mesh geometry={geometry} material={material} {...props} />
}

export function Reel({ material, ...props }) {
  return <group {...props}>
    <mesh material={material}><torusGeometry args={[0.38, 0.065, 8, 24]} /></mesh>
    {[0, 1, 2].map((i) => <mesh key={i} rotation-z={i * Math.PI / 3} material={material}>
      <boxGeometry args={[0.72, 0.06, 0.08]} />
    </mesh>)}
    <mesh material={material}><cylinderGeometry args={[0.09, 0.09, 0.12, 12]} /></mesh>
  </group>
}
