import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { cameraClearFraction } from './shorelines'

const INTRO = { pos: new THREE.Vector3(17, 3.6, 17), look: new THREE.Vector3(-12, 4, -2) }
const MAX_YAW = Math.PI * 2 / 3
const MAX_PITCH = 0.4
const FOLLOW_DISTANCE = 32

export default function CameraRig({ view = 'intro', ship }) {
  const { camera, gl, scene } = useThree()
  const look = useRef(INTRO.look.clone())
  const targetPos = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3())
  const orbit = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0, dragging: false, pointerId: null, x: 0, y: 0 })
  const ray = useRef(new THREE.Raycaster())
  const ndc = useRef(new THREE.Vector2())
  const clearDistance = useRef(FOLLOW_DISTANCE)
  const deckAge = useRef(0)

  useEffect(() => {
    if (view !== 'deck') return
    const canvas = gl.domElement
    const controls = orbit.current
    const endDrag = (event) => {
      if (event.pointerId !== controls.pointerId) return
      controls.dragging = false
      controls.pointerId = null
      controls.targetYaw = 0
      controls.targetPitch = 0
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    }
    const pointerDown = (event) => {
      if (event.button !== 0 || ship.current.dragging || controls.dragging) return
      const rect = canvas.getBoundingClientRect()
      ndc.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        1 - ((event.clientY - rect.top) / rect.height) * 2,
      )
      const wheel = scene.getObjectByName('wheel')
      if (wheel) {
        ray.current.setFromCamera(ndc.current, camera)
        if (ray.current.intersectObject(wheel, true).length) return
      }
      controls.dragging = true
      controls.pointerId = event.pointerId
      controls.x = event.clientX
      controls.y = event.clientY
      canvas.setPointerCapture(event.pointerId)
    }
    const pointerMove = (event) => {
      if (!controls.dragging || event.pointerId !== controls.pointerId) return
      controls.targetYaw = THREE.MathUtils.clamp(controls.targetYaw + (controls.x - event.clientX) * 0.006, -MAX_YAW, MAX_YAW)
      controls.targetPitch = THREE.MathUtils.clamp(controls.targetPitch + (controls.y - event.clientY) * 0.004, -MAX_PITCH, MAX_PITCH)
      controls.x = event.clientX
      controls.y = event.clientY
    }
    const reset = () => {
      controls.dragging = false
      controls.pointerId = null
      controls.targetYaw = 0
      controls.targetPitch = 0
    }
    canvas.addEventListener('pointerdown', pointerDown)
    window.addEventListener('pointermove', pointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    window.addEventListener('blur', reset)
    return () => {
      reset()
      canvas.removeEventListener('pointerdown', pointerDown)
      window.removeEventListener('pointermove', pointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('blur', reset)
    }
  }, [view, gl, scene, camera, ship])

  useFrame(({ clock }, delta) => {
    if (view !== 'intro' && view !== 'deck') return
    const t = clock.elapsedTime
    const k = 1 - Math.pow(0.15, delta) // same easing for Set sail and follow motion
    const state = ship.current
    if (view === 'intro') {
      targetPos.current.copy(INTRO.pos)
      targetPos.current.y += Math.sin(t * 0.7) * 0.25
      targetLook.current.copy(INTRO.look)
      camera.position.lerp(targetPos.current, k)
    } else {
      const controls = orbit.current
      deckAge.current += delta
      const ease = 1 - Math.exp(-delta / (controls.dragging ? 0.12 : 0.35))
      controls.yaw += (controls.targetYaw - controls.yaw) * ease
      controls.pitch += (controls.targetPitch - controls.pitch) * ease
      const angle = state.heading + controls.yaw
      const sin = Math.sin(angle), cos = Math.cos(angle)
      const desiredX = state.x + sin * FOLLOW_DISTANCE
      const desiredZ = state.z + cos * FOLLOW_DISTANCE
      const allowed = FOLLOW_DISTANCE * cameraClearFraction(state.x, state.z, desiredX, desiredZ)
      // Close in immediately enough to stay outside rock; ease back out after it clears.
      clearDistance.current = Math.min(allowed, THREE.MathUtils.damp(clearDistance.current, allowed, 4, delta))
      targetPos.current.set(
        state.x + sin * clearDistance.current,
        14 + state.y * 0.3 + controls.pitch * 12,
        state.z + cos * clearDistance.current,
      )
      targetLook.current.set(
        state.x - Math.sin(state.heading) * 10,
        4 + state.y * 0.2,
        state.z - Math.cos(state.heading) * 10,
      )
      const followK = deckAge.current < 2 ? k : 1 - Math.exp(-delta / 0.25)
      camera.position.lerp(targetPos.current, followK)
      // The lagged camera must also remain on the clear side of a shoreline.
      const fraction = cameraClearFraction(state.x, state.z, camera.position.x, camera.position.z)
      if (fraction < 1) {
        camera.position.x = state.x + (camera.position.x - state.x) * fraction
        camera.position.z = state.z + (camera.position.z - state.z) * fraction
      }
    }
    look.current.lerp(targetLook.current, k)
    camera.lookAt(look.current)
    camera.rotation.z += Math.sin(t * 0.5) * 0.004
  })

  return null
}
