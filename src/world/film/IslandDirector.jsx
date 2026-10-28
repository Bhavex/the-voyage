import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clearSailingInput, angleDifference } from '../sailing'
import { CAPTAIN_SPAWN, DOCK_SHIP, FILM_ISLAND } from './layout'
import { canSkipArrival } from './arrival'
import { approachPoints, createApproachCurve, flightDuration, flightShot, pathDistance, smootherstep } from './flight'

const ease = (t) => t * t * (3 - 2 * t)

export default function IslandDirector({ game }) {
  const { mode, ship, captain, trip, changeMode } = game
  const { camera } = useThree()
  const flight = useRef(null)
  const point = useRef(new THREE.Vector3())
  const tangent = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const previous = useRef(new THREE.Vector3())
  const previousLook = useRef(new THREE.Vector3())
  const moor = () => {
    Object.assign(ship.current, { x: FILM_ISLAND.position[0] + DOCK_SHIP.x, z: FILM_ISLAND.position[1] + DOCK_SHIP.z,
      heading: DOCK_SHIP.heading, speed: 0, sailLevel: 0, steering: 0, grounded: false, groundedShore: null })
    clearSailingInput(ship.current)
  }
  useEffect(() => {
    flight.current = null
    if (mode === 'arrival') {
      const s = ship.current
      clearSailingInput(s)
      s.sailLevel = 0
      trip.current.canArrive = false
      // The ship sails a smooth path to the berth, leaving at its own heading and speed. The camera starts
      // exactly where the sailing camera is, so nothing cuts or jumps when the fly-in begins.
      const curve = createApproachCurve(approachPoints({ x: s.x - FILM_ISLAND.position[0], z: s.z - FILM_ISLAND.position[1] }, s.heading))
      const length = curve.getLength()
      const duration = flightDuration(length)
      camera.getWorldDirection(forward.current)
      flight.current = {
        curve, length, duration,
        startSlope: Math.max(s.speed, 6) * duration,
        camOffset: new THREE.Vector3(camera.position.x - s.x, camera.position.y, camera.position.z - s.z),
        lookOffset: new THREE.Vector3().copy(camera.position).addScaledVector(forward.current, 42).sub(new THREE.Vector3(s.x, 0, s.z)),
        wide: THREE.MathUtils.clamp(1.2 / camera.aspect, 1, 1.8), // pull back a little on tall phone screens
      }
      previous.current.copy(camera.position)
      trip.current.lookPoint = new THREE.Vector3().copy(camera.position).addScaledVector(forward.current, 42)
      trip.current.camVelocity = new THREE.Vector3()
      trip.current.lookVelocity = new THREE.Vector3()
      previousLook.current.copy(trip.current.lookPoint)
    }
    if (mode === 'disembark') {
      moor()
      Object.assign(captain.current, { x: 8, z: 40, heading: Math.PI / 2, moving: true, speed: 0, accumulator: 0, hadInput: false, running: false })
      trip.current.yaw = 0
      trip.current.pitch = game.touch ? 0.35 : 0
    }
    if (mode === 'departure') {
      trip.current.departX = captain.current.x
      trip.current.departZ = captain.current.z
    }
    // moor uses only the stable ship ref and layout constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ship, captain, trip, camera, game.touch])
  useEffect(() => {
    if (mode !== 'arrival') return
    const skip = (event) => {
      if (!canSkipArrival(event.code, trip.current.elapsed, event.repeat)) {
        if (['Space', 'Enter', 'Escape'].includes(event.code)) event.preventDefault()
        return
      }
      event.preventDefault()
      changeMode('disembark')
    }
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [mode, changeMode, trip])

  useFrame((_, delta) => {
    if (mode !== trip.current.mode) return
    const s = ship.current
    const distance = Math.hypot(s.x - FILM_ISLAND.position[0], s.z - FILM_ISLAND.position[1])
    if (mode === 'sailing') {
      if (distance > 130) trip.current.canArrive = true
      if (distance < 100 && trip.current.canArrive) {
        trip.current.canArrive = false
        changeMode('arrival')
      }
      return
    }
    trip.current.elapsed += Math.min(delta, 0.05)
    if (mode === 'arrival' && flight.current) {
      const f = flight.current
      const elapsed = trip.current.elapsed
      const tau = Math.min(1, elapsed / f.duration)
      const u = pathDistance(tau, f.length, f.startSlope) / f.length
      f.curve.getPointAt(u, point.current)
      f.curve.getTangentAt(u, tangent.current)
      const [ix, iz] = FILM_ISLAND.position
      s.x = ix + point.current.x
      s.z = iz + point.current.z
      s.speed = 0
      s.steering = 0
      s.heading += angleDifference(Math.atan2(-tangent.current.x, -tangent.current.z), s.heading) * (1 - Math.exp(-delta * (4 + 4 * smootherstep((tau - 0.75) / 0.15))))
      if (tau === 1) s.heading = DOCK_SHIP.heading
      const shot = flightShot(point.current, { x: -Math.sin(s.heading), z: -Math.cos(s.heading) }, u, smootherstep((tau - 0.7) / 0.3), f.wide)
      // Blend from the sailing camera's offset to the shot over the first moments, then follow the shot.
      const intro = smootherstep(elapsed / 2.4)
      camera.position.set(
        s.x + THREE.MathUtils.lerp(f.camOffset.x, ix + shot.cam[0] - s.x, intro),
        THREE.MathUtils.lerp(f.camOffset.y, shot.cam[1], intro),
        s.z + THREE.MathUtils.lerp(f.camOffset.z, iz + shot.cam[2] - s.z, intro),
      )
      const look = trip.current.lookPoint.set(
        s.x + THREE.MathUtils.lerp(f.lookOffset.x, ix + shot.look[0] - s.x, intro),
        THREE.MathUtils.lerp(f.lookOffset.y, shot.look[1], intro),
        s.z + THREE.MathUtils.lerp(f.lookOffset.z, iz + shot.look[2] - s.z, intro),
      )
      camera.lookAt(look)
      // IslandCamera takes over from this pose and speed, so docking never lurches.
      trip.current.camVelocity.subVectors(camera.position, previous.current).divideScalar(Math.max(delta, 1e-3))
      trip.current.lookVelocity.subVectors(look, previousLook.current).divideScalar(Math.max(delta, 1e-3))
      previous.current.copy(camera.position)
      previousLook.current.copy(look)
      if (tau === 1) changeMode('disembark')
    }
    if (mode === 'disembark') {
      const t = ease(Math.min(1, trip.current.elapsed / 2.4))
      const crossing = game.touch ? t : Math.min(1, t / 0.65)
      captain.current.x = THREE.MathUtils.lerp(8, CAPTAIN_SPAWN.x, crossing)
      captain.current.z = game.touch ? THREE.MathUtils.lerp(40, 38, t) : t < 0.65
        ? THREE.MathUtils.lerp(40, 38, crossing) : THREE.MathUtils.lerp(38, CAPTAIN_SPAWN.z, (t - 0.65) / 0.35)
      captain.current.moving = true
      if (!game.touch) captain.current.heading = THREE.MathUtils.lerp(Math.PI / 2, 0, ease(Math.max(0, (t - 0.65) / 0.35)))
      if (t === 1) {
        captain.current.heading = 0
        captain.current.moving = false
        changeMode('island')
      }
    }
    if (mode === 'departure') {
      const t = ease(Math.min(1, trip.current.elapsed / 2))
      const departing = ease(Math.max(0, Math.min(1, (trip.current.elapsed - 2) / 2.5)))
      captain.current.x = THREE.MathUtils.lerp(trip.current.departX, 8, t)
      captain.current.z = THREE.MathUtils.lerp(trip.current.departZ, 40, t)
      captain.current.heading = -Math.PI / 2
      captain.current.moving = true
      if (t === 1) {
        s.z = FILM_ISLAND.position[1] + THREE.MathUtils.lerp(40, 54, departing)
        s.heading = Math.PI * departing
      }
      if (departing === 1) {
        Object.assign(s, { x: FILM_ISLAND.position[0] + 8, z: FILM_ISLAND.position[1] + 54,
          heading: Math.PI, speed: 0, sailLevel: 1, steering: 0, grounded: false, groundedShore: null })
        clearSailingInput(s)
        captain.current.moving = false
        changeMode('sailing')
      }
    }
  }, -4)
  return null
}
