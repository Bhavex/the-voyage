import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { cameraClearFraction } from '../shorelines'
import { BUILDINGS, DOCK_CAMERA, DOCK_LOOK, GROUND_Y, LANDMARKS, insideProjectorBooth, worldPosition } from './layout'
import { ROOM } from './room'
import { smoothDampVector } from './flight'

const ease = (t) => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x) }

export default function IslandCamera({ game }) {
  const { camera } = useThree()
  const state = useMemo(() => ({
    desired: new THREE.Vector3(), target: new THREE.Vector3(), position: new THREE.Vector3(),
    look: new THREE.Vector3(...worldPosition(0, 4.5, 38)), pivot: new THREE.Vector3(),
    direction: new THREE.Vector3(), alternate: new THREE.Vector3(), hit: new THREE.Vector3(), ray: new THREE.Ray(),
    distance: 7, active: false, following: false, composition: null,
    velocity: new THREE.Vector3(), lookVelocity: new THREE.Vector3(), shipPosition: new THREE.Vector3(), shipLook: new THREE.Vector3(), waypoint: new THREE.Vector3(),
    sinceSwitch: 0,
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
  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, 0.05)
    const active = ['disembark', 'island', 'departure', 'lighthouse'].includes(game.mode)
    if (!active) { state.active = false; state.following = false; return }
    if (!state.active) {
      // Continue from wherever the fly-in (or a skip of it) left the camera, with its speed and aim.
      const trip = game.trip.current
      state.position.copy(camera.position)
      state.velocity.set(0, 0, 0).add(trip.camVelocity ?? state.velocity)
      state.lookVelocity.set(0, 0, 0).add(trip.lookVelocity ?? state.lookVelocity)
      if (trip.lookPoint) state.look.copy(trip.lookPoint)
      else state.look.copy(camera.position).addScaledVector(camera.getWorldDirection(state.direction), 30)
      trip.lookPoint = trip.camVelocity = trip.lookVelocity = null
      state.active = true
      state.composition = null
    }
    const c = game.captain.current
    const booth = !game.touch && game.mode === 'island' && !['playing', 'paused', 'ended', 'soon', 'blocked', 'loading'].includes(game.film) && insideProjectorBooth(c)
    if (game.mode === 'lighthouse') {
      const yaw = game.trip.current.yaw
      if (game.touch) {
        state.desired.set(...worldPosition(ROOM.x + 1, 7.8, 5.1))
        state.target.set(...worldPosition(ROOM.x - 0.8, 6.1, -3))
      } else {
        state.desired.set(...worldPosition(
          THREE.MathUtils.clamp(c.x + Math.sin(yaw) * 4.5, ROOM.x - 6.2, ROOM.x + 6.2),
          GROUND_Y + 3.5,
          THREE.MathUtils.clamp(c.z + Math.cos(yaw) * 4.5, -5.2, 5.2)))
        state.target.set(...worldPosition(c.x - Math.sin(yaw) * 3, GROUND_Y + 2.2 + game.trip.current.pitch * 5, c.z - Math.cos(yaw) * 3))
      }
      // An interior doorway is a cut between sets; never fly through the sea or walls.
      if (state.composition !== 'room') {
        state.position.copy(state.desired); state.look.copy(state.target)
        state.velocity.set(0, 0, 0); state.lookVelocity.set(0, 0, 0)
      }
    } else if (game.mode === 'disembark') {
      // The fly-in's last frame: above and behind the ship, the dock leading toward the cinema.
      state.desired.set(...worldPosition(...DOCK_CAMERA))
      state.target.set(...worldPosition(...DOCK_LOOK))
    } else if (game.mode === 'departure') {
      // Watch the captain walk back, then arc out to sea around the ship and settle behind it as it sails
      // off, exactly where CameraRig expects to take over. The arc is wide so the pan stays slow.
      const back = ease((game.trip.current.elapsed - 0.3) / 4.2)
      const ship = game.ship.current
      const reach = Math.max(12, 32 * cameraClearFraction(ship.x, ship.z, ship.x, ship.z - 32))
      state.shipPosition.set(ship.x, 14, ship.z - reach)
      state.waypoint.set(ship.x + 24, 15, ship.z + 6)
      state.shipLook.set(ship.x, 4, ship.z + 10 * back) // ahead along the final course, not the spinning bow
      state.desired.set(...worldPosition(...DOCK_CAMERA))
      state.desired.multiplyScalar((1 - back) ** 2).addScaledVector(state.waypoint, 2 * (1 - back) * back).addScaledVector(state.shipPosition, back * back)
      state.target.set(...worldPosition(c.x, GROUND_Y + 1.2, c.z)).lerp(state.shipLook, back)
    } else if (booth) {
      // The booth's walls/roof lift away for this fixed, unobstructed composition.
      state.desired.set(...worldPosition(-3.5, 8, 13))
      state.target.set(...worldPosition(4, 5.4, -5))
    } else if (game.touch || ['playing', 'paused', 'ended', 'soon', 'blocked', 'loading'].includes(game.film)) {
      const landmark = LANDMARKS.find((item) => item.id === (game.touch ? game.focus : 'projector')) ?? LANDMARKS[3]
      state.desired.set(...worldPosition(...landmark.camera))
      state.target.set(...worldPosition(landmark.position[0], landmark.id === 'lighthouse' ? 12 : landmark.id === 'projector' ? 8.4 : 5.5, landmark.id === 'projector' ? -19.5 : landmark.position[2]))
    } else {
      const { yaw, pitch } = game.trip.current
      state.desired.set(...worldPosition(c.x + Math.sin(yaw) * 7, GROUND_Y + 3.5 + pitch * 3, c.z + Math.cos(yaw) * 7))
      state.target.set(...worldPosition(c.x - Math.sin(yaw) * 3, GROUND_Y + 2.2, c.z - Math.cos(yaw) * 3))
    }
    const touchK = 1 - Math.exp(-delta * 4)
    const fov = game.mode === 'lighthouse' ? (game.touch ? 85 : 60) : game.touch && game.focus === 'projector' && game.mode === 'island'
      ? Math.max(45, THREE.MathUtils.radToDeg(2 * Math.atan(8 / (19 * camera.aspect)))) : 45
    camera.fov = THREE.MathUtils.lerp(camera.fov, fov, touchK)
    camera.updateProjectionMatrix()
    const following = game.mode === 'island' && !game.touch && !booth && !['playing', 'paused', 'ended', 'soon', 'blocked', 'loading'].includes(game.film)
    const composition = game.mode === 'lighthouse' ? 'room' : game.mode !== 'island' ? 'dock' : game.touch ? 'touch' : booth ? 'booth' : following ? 'follow' : 'film'
    if (state.composition === 'room' && composition !== 'room') {
      state.position.copy(state.desired); state.look.copy(state.target)
      state.velocity.set(0, 0, 0); state.lookVelocity.set(0, 0, 0)
    } else if (!game.touch && composition !== 'room' && state.composition !== composition) state.position.copy(camera.position)
    if (state.composition !== composition) state.sinceSwitch = 0
    state.composition = composition
    state.sinceSwitch += delta
    // Springs keep the speed when the shot changes, and ease slower for a moment after each change.
    const slowness = 1 - ease(state.sinceSwitch / 1.6)
    smoothDampVector(state.position, state.desired, state.velocity, (game.touch ? 0.45 : 0.17) + 0.55 * slowness, delta)
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
    smoothDampVector(state.look, state.target, state.lookVelocity, (game.touch ? 0.25 : 0.125) + 0.4 * slowness, delta)
    camera.lookAt(state.look)
  })
  return null
}
