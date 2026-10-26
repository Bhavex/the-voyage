import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BUILDINGS, FILM_ISLAND, GROUND_Y, LANDMARKS, worldPosition } from './layout'

export default function IslandCamera({ game }) {
  const { camera } = useThree()
  const desired = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const smoothedLook = useRef(new THREE.Vector3(...worldPosition(0, 4.5, 38)))
  const ray = useRef(new THREE.Ray())
  const direction = useRef(new THREE.Vector3())
  const hit = useRef(new THREE.Vector3())
  const boxes = useMemo(() => [...BUILDINGS, { x: 0.6, z: 4.2, width: 0.5, depth: 4.8, height: 5.5 }, { x: 7.4, z: 4.2, width: 0.5, depth: 4.8, height: 5.5 }, { x: 4, z: 6.5, width: 7, depth: 0.5, height: 5.5 }, { x: 22, z: -8, width: 6, depth: 6, height: 20 }].map((b) => new THREE.Box3(
    new THREE.Vector3(...worldPosition(b.x - b.width / 2 - 0.4, GROUND_Y, b.z - b.depth / 2 - 0.4)),
    new THREE.Vector3(...worldPosition(b.x + b.width / 2 + 0.4, GROUND_Y + b.height + 2, b.z + b.depth / 2 + 0.4)),
  )), [])
  useFrame((_, delta) => {
    if (!['disembark', 'island', 'departure'].includes(game.mode)) return
    if (game.mode !== 'island') {
      desired.current.set(...worldPosition(16, 12, 53))
      target.current.set(...worldPosition(game.captain.current.x, GROUND_Y + 1.2, game.captain.current.z))
    } else if (game.touch || ['playing', 'soon', 'blocked', 'loading'].includes(game.film)) {
      const landmark = LANDMARKS.find((item) => item.id === (game.touch ? game.focus : 'projector')) ?? LANDMARKS[3]
      desired.current.set(...worldPosition(...landmark.camera))
      target.current.set(...worldPosition(landmark.position[0], landmark.id === 'lighthouse' ? 12 : landmark.id === 'projector' ? 8.4 : 5.5, landmark.id === 'projector' ? -19.5 : landmark.position[2]))
    } else {
      const c = game.captain.current
      const { yaw, pitch } = game.trip.current
      desired.current.set(...worldPosition(c.x + Math.sin(yaw) * 8.5, GROUND_Y + 5.3 + pitch * 4, c.z + Math.cos(yaw) * 8.5))
      target.current.set(FILM_ISLAND.position[0] + c.x, GROUND_Y + 1.5, FILM_ISLAND.position[1] + c.z)
    }
    const k = 1 - Math.exp(-delta * 4)
    // A wider portrait lens keeps the complete cinema screen in view.
    const fov = game.touch && game.focus === 'projector' && game.mode === 'island'
      ? Math.max(45, THREE.MathUtils.radToDeg(2 * Math.atan(8 / (19 * camera.aspect)))) : 45
    camera.fov = THREE.MathUtils.lerp(camera.fov, fov, k)
    camera.updateProjectionMatrix()
    camera.position.lerp(desired.current, k)
    if (game.mode === 'island' && !game.touch && !['playing', 'soon', 'blocked', 'loading'].includes(game.film)) {
      direction.current.subVectors(camera.position, target.current)
      let distance = direction.current.length()
      ray.current.set(target.current, direction.current.normalize())
      for (const box of boxes) {
        if (ray.current.intersectBox(box, hit.current)) distance = Math.min(distance, Math.max(1, hit.current.distanceTo(target.current) - 0.3))
      }
      camera.position.copy(target.current).addScaledVector(direction.current, distance)
    }
    smoothedLook.current.lerp(target.current, k)
    camera.lookAt(smoothedLook.current)
  })
  return null
}
