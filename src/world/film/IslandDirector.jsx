import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clearSailingInput, angleDifference } from '../sailing'
import { CAPTAIN_SPAWN, DOCK_SHIP, FILM_ISLAND, worldPosition } from './layout'

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
        camera.position.clone(),
        new THREE.Vector3(...worldPosition(-58, 30, 48)),
        new THREE.Vector3(...worldPosition(-42, 27, -45)),
        new THREE.Vector3(...worldPosition(47, 25, -27)),
        new THREE.Vector3(...worldPosition(18, 12, 55)),
      ], false, 'centripetal')
    }
    if (mode === 'disembark') {
      moor()
      Object.assign(captain.current, { x: 8, z: 40, heading: Math.PI / 2, moving: true })
      trip.current.yaw = 0
    }
    if (mode === 'departure') {
      trip.current.departX = captain.current.x
      trip.current.departZ = captain.current.z
    }
    // moor uses only the stable ship ref and layout constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ship, captain, trip, camera])
  useEffect(() => {
    if (mode !== 'arrival') return
    const skip = (event) => {
      if (event.repeat) return
      event.preventDefault()
      changeMode('disembark')
    }
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [mode, changeMode])

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
      target.current.set(...worldPosition(0, THREE.MathUtils.lerp(7, 4.5, dockBlend), 38 * dockBlend))
      camera.lookAt(target.current)
      if (t === 1) changeMode('disembark')
    }
    if (mode === 'disembark') {
      const t = ease(Math.min(1, trip.current.elapsed / 2.4))
      captain.current.x = THREE.MathUtils.lerp(8, CAPTAIN_SPAWN.x, t)
      captain.current.z = THREE.MathUtils.lerp(40, CAPTAIN_SPAWN.z, t)
      captain.current.moving = true
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
