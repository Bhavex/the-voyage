import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OPEN_SEA, ISLAND_PALETTES } from '../../config/palette'
import { FILM_ISLAND, worldPosition } from './layout'

const FILM_PALETTE = ISLAND_PALETTES.film.land

export default function Mooring({ game }) {
  const { ship } = game
  const root = useRef()
  const plank = useRef()
  const start = useMemo(() => new THREE.Vector3(...worldPosition(2.4, 3.12, 38.6)), [])
  const end = useMemo(() => new THREE.Vector3(), [])
  const direction = useMemo(() => new THREE.Vector3(), [])
  const axis = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const geometry = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3)), [])
  useFrame(() => {
    root.current.visible = game.mode !== 'departure' || game.trip.current.elapsed < 2
    end.set(ship.current.x - 1.4, ship.current.y + 1.32, ship.current.z - 0.4)
    direction.subVectors(end, start)
    plank.current.position.copy(start).addScaledVector(direction, 0.5)
    plank.current.scale.x = direction.length()
    plank.current.quaternion.setFromUnitVectors(axis, direction.normalize())
    const positions = geometry.attributes.position
    const [x, z] = FILM_ISLAND.position
    positions.setXYZ(0, x + 3, 3.8, z + 33)
    positions.setXYZ(1, ship.current.x - 1.5, ship.current.y + 1.4, ship.current.z - 3)
    positions.setXYZ(2, x + 3, 3.8, z + 43)
    positions.setXYZ(3, ship.current.x - 1.5, ship.current.y + 1.4, ship.current.z + 3)
    positions.needsUpdate = true
  })
  return <group ref={root} name="mooring">
    <lineSegments geometry={geometry} frustumCulled={false}><lineBasicMaterial color={OPEN_SEA.oceanDeep} /></lineSegments>
    <mesh ref={plank} name="gangplank">
      <boxGeometry args={[1, 0.18, 1.7]} /><meshToonMaterial color={FILM_PALETTE.wood} />
    </mesh>
  </group>
}
