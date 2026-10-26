import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const INTRO = { pos: new THREE.Vector3(17, 3.6, 17), look: new THREE.Vector3(-12, 4, -2) }

export default function CameraRig({ view = 'intro', ship }) {
  const { camera, pointer } = useThree()
  const look = useRef(INTRO.look.clone())
  const tmpPos = useRef(new THREE.Vector3())
  const tmpLook = useRef(new THREE.Vector3())
  const mouse = useRef(new THREE.Vector2())

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const k = 1 - Math.pow(0.15, delta) // preserve the cinematic Set sail easing
    const state = ship.current
    // Dragging the helm should steer without also swinging the view.
    if (!state.dragging) mouse.current.copy(pointer)
    const { x: mouseX, y: mouseY } = mouse.current

    if (view === 'intro') {
      tmpPos.current.copy(INTRO.pos)
      tmpPos.current.x += mouseX * 2.5
      tmpPos.current.y += mouseY * 1.2 + Math.sin(t * 0.7) * 0.25
      tmpLook.current.copy(INTRO.look)
      tmpLook.current.x += mouseX * 4
    } else {
      const sin = Math.sin(state.heading), cos = Math.cos(state.heading)
      const side = mouseX * 2.5
      // Rotate the old deck offset with the heading, then ease the camera
      // towards it. This leaves a little weight and lag through turns.
      tmpPos.current.set(
        state.x + sin * 22 + cos * side,
        9 + state.y * 0.3 + mouseY * 1.2 + Math.sin(t * 0.7) * 0.25,
        state.z + cos * 22 - sin * side,
      )
      tmpLook.current.set(
        state.x - sin * 20 + cos * mouseX * 4,
        4 + state.y * 0.2,
        state.z - cos * 20 - sin * mouseX * 4,
      )
    }
    camera.position.lerp(tmpPos.current, k)
    look.current.lerp(tmpLook.current, k)
    camera.lookAt(look.current)
    camera.rotation.z += Math.sin(t * 0.5) * 0.004
  })

  return null
}
