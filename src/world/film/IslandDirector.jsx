import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clearSailingInput, angleDifference } from '../sailing'
import { CAPTAIN_SPAWN, DOCK_SHIP, FILM_ISLAND, worldPosition } from './layout'

import { canSkipArrival } from './arrival'

const ease = (t) => t * t * (3 - 2 * t)

export default function IslandDirector({ game }) {
  const { mode, ship, captain, trip, changeMode } = game
  const { camera } = useThree()
  const route = useRef(null)
  const point = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const moor = () => {
    Object.assign(ship.current, { x: FILM_ISLAND.position[0] + DOCK_SHIP.x, z: FILM_ISLAND.position[1] + DOCK_SHIP.z,
      heading: DOCK_SHIP.heading, speed: 0, sailLevel: 0, steering: 0, grounded: false, groundedShore: null })
    clearSailingInput(ship.current)
  }
  useEffect(() => {
    if (mode === 'arrival') {
      clearSailingInput(ship.current)
      ship.current.sailLevel = 0
      trip.current.canArrive = false
      const dx = ship.current.x - FILM_ISLAND.position[0]
      const dz = ship.current.z - FILM_ISLAND.position[1]
      trip.current.startRadius = Math.hypot(dx, dz)
      trip.current.startAngle = Math.atan2(dx, dz)
      route.current = new THREE.CatmullRomCurve3([
        game.touch ? camera.position.clone() : new THREE.Vector3(...worldPosition(-50, 26, 55)),
        new THREE.Vector3(...worldPosition(-58, 30, 48)),
        new THREE.Vector3(...worldPosition(game.touch ? -42 : -55, 27, game.touch ? -45 : 10)),
        new THREE.Vector3(...worldPosition(47, 25, game.touch ? -27 : 30)),
        new THREE.Vector3(...worldPosition(game.touch ? 18 : -16, 12, game.touch ? 55 : 42)),
      ], false, 'centripetal')
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
    if (mode === 'arrival' && route.current) {
      const t = Math.min(1, trip.current.elapsed / 8)
      const a = ease(Math.min(1, t / 0.75))
      const angle = trip.current.startAngle + angleDifference(0, trip.current.startAngle) * a
      const radius = THREE.MathUtils.lerp(trip.current.startRadius, 72, a)
      let x = Math.sin(angle) * radius, z = Math.cos(angle) * radius
      if (t > 0.75) {
        const end = ease((t - 0.75) / 0.25)
        x = THREE.MathUtils.lerp(0, DOCK_SHIP.x, end)
        z = THREE.MathUtils.lerp(72, DOCK_SHIP.z, end)
      }
      const nextX = FILM_ISLAND.position[0] + x, nextZ = FILM_ISLAND.position[1] + z
      const heading = Math.atan2(s.x - nextX, s.z - nextZ)
      s.heading += angleDifference(t > 0.95 ? 0 : heading, s.heading) * (1 - Math.exp(-delta * 5))
      s.x = nextX; s.z = nextZ; s.speed = 0
      route.current.getPoint(ease(t), point.current)
      camera.position.copy(point.current)
      const dockBlend = ease(Math.max(0, (t - 0.7) / 0.3))
      target.current.set(...worldPosition(0, THREE.MathUtils.lerp(7, 4.5, dockBlend), (game.touch ? 38 : 28) * dockBlend))
      camera.lookAt(target.current)
      if (t === 1) changeMode('disembark')
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
