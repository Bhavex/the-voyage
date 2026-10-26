import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BUILDINGS, GROUND_Y, LANDMARKS, insideProjectorBooth, worldPosition } from './layout'

export default function IslandCamera({ game }) {
  const { camera } = useThree()
  const state = useMemo(() => ({
    desired: new THREE.Vector3(), target: new THREE.Vector3(), position: new THREE.Vector3(),
    look: new THREE.Vector3(...worldPosition(0, 4.5, 38)), pivot: new THREE.Vector3(),
    direction: new THREE.Vector3(), alternate: new THREE.Vector3(), hit: new THREE.Vector3(), ray: new THREE.Ray(),
    distance: 7, active: false, following: false, composition: null,
  }), [])
  // Only substantial architecture blocks the camera; trees and small props do not.
  const boxes = useMemo(() => [...BUILDINGS,
    { x: 0.6, z: 4.2, width: 0.5, depth: 4.8, height: 5.5, booth: true },
    { x: 7.4, z: 4.2, width: 0.5, depth: 4.8, height: 5.5, booth: true },
    { x: 4, z: 6.5, width: 7, depth: 0.5, height: 5.5, booth: true },
    { x: 22, z: -8, width: 6, depth: 6, height: 20 },
  ].map((b) => ({ booth: b.booth, box: new THREE.Box3(
    new THREE.Vector3(...worldPosition(b.x - b.width / 2 - 0.25, GROUND_Y, b.z - b.depth / 2 - 0.25)),
    new THREE.Vector3(...worldPosition(b.x + b.width / 2 + 0.25, GROUND_Y + b.height + 1.3, b.z + b.depth / 2 + 0.25)),
  ) })), [])
  useFrame((_, delta) => {
    const active = ['disembark', 'island', 'departure'].includes(game.mode)
    if (!active) { state.active = false; state.following = false; return }
    if (!state.active) { state.position.copy(camera.position); state.active = true }
    const c = game.captain.current
    const booth = !game.touch && game.mode === 'island' && insideProjectorBooth(c)
    if (game.mode !== 'island') {
      state.desired.set(...worldPosition(16, 12, 53))
      state.target.set(...worldPosition(c.x, GROUND_Y + 1.2, c.z))
    } else if (booth) {
      // The booth's walls/roof lift away for this fixed, unobstructed composition.
      state.desired.set(...worldPosition(-3.5, 8, 13))
      state.target.set(...worldPosition(4, 5.4, -5))
    } else if (game.touch || ['playing', 'soon', 'blocked', 'loading'].includes(game.film)) {
      const landmark = LANDMARKS.find((item) => item.id === (game.touch ? game.focus : 'projector')) ?? LANDMARKS[3]
      state.desired.set(...worldPosition(...landmark.camera))
      state.target.set(...worldPosition(landmark.position[0], landmark.id === 'lighthouse' ? 12 : landmark.id === 'projector' ? 8.4 : 5.5, landmark.id === 'projector' ? -19.5 : landmark.position[2]))
    } else {
      const { yaw, pitch } = game.trip.current
      state.desired.set(...worldPosition(c.x + Math.sin(yaw) * 7, GROUND_Y + 3.5 + pitch * 3, c.z + Math.cos(yaw) * 7))
      state.target.set(...worldPosition(c.x - Math.sin(yaw) * 3, GROUND_Y + 2.2, c.z - Math.cos(yaw) * 3))
    }
    const touchK = 1 - Math.exp(-delta * 4)
    const fov = game.touch && game.focus === 'projector' && game.mode === 'island'
      ? Math.max(45, THREE.MathUtils.radToDeg(2 * Math.atan(8 / (19 * camera.aspect)))) : 45
    camera.fov = THREE.MathUtils.lerp(camera.fov, fov, touchK)
    camera.updateProjectionMatrix()
    const following = game.mode === 'island' && !game.touch && !booth && !['playing', 'soon', 'blocked', 'loading'].includes(game.film)
    const composition = game.mode !== 'island' ? 'dock' : game.touch ? 'touch' : booth ? 'booth' : following ? 'follow' : 'film'
    if (!game.touch && state.composition !== composition) state.position.copy(camera.position)
    state.composition = composition
    state.position.lerp(state.desired, game.touch ? touchK : 1 - Math.exp(-delta * 6))
    camera.position.copy(state.position)
    if (following) {
      state.pivot.set(...worldPosition(c.x, GROUND_Y + 2.2, c.z))
      state.direction.subVectors(state.position, state.pivot)
      const fullDistance = Math.max(2.5, state.direction.length())
      state.direction.normalize()
      const clearance = (direction) => {
        let distance = fullDistance
        state.ray.set(state.pivot, direction)
        for (const item of boxes) {
          if (state.ray.intersectBox(item.box, state.hit)) distance = Math.min(distance, state.hit.distanceTo(state.pivot) - 0.2)
        }
        return distance
      }
      let available = clearance(state.direction)
      if (available < 2.5) {
        // At a wall, move to the open side instead of putting the lens into the captain.
        const angle = Math.atan2(state.direction.x, state.direction.z)
        for (const offset of [Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2, Math.PI]) {
          state.alternate.set(Math.sin(angle + offset), state.direction.y, Math.cos(angle + offset)).normalize()
          const distance = clearance(state.alternate)
          if (distance >= 2.5) { state.direction.copy(state.alternate); available = distance; break }
        }
      }
      const limit = Math.max(2.5, Math.min(fullDistance, available - (available < fullDistance ? 0.6 : 0)))
      if (!state.following) state.distance = fullDistance
      state.distance = THREE.MathUtils.damp(state.distance, limit, limit < state.distance ? 12 : 3, delta)
      // Anticipation above makes pull-in smooth; this hard bound prevents penetration on a fast turn.
      const distance = Math.max(2.5, Math.min(state.distance, available, fullDistance))
      camera.position.copy(state.pivot).addScaledVector(state.direction, distance)
    }
    state.following = following
    state.look.lerp(state.target, game.touch ? touchK : 1 - Math.exp(-delta * 8))
    camera.lookAt(state.look)
  })
  return null
}
