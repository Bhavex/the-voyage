import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// TEMPORARY CAMERA
// Two fixed views until the real camera system is built (see ROADMAP.md, week 2):
//  - "intro": low over the water, looking at the ship and the sunrise
//  - "deck":  behind and above the ship, where sailing will happen
// The mouse adds a small look-around, and the camera sways with the sea.

const VIEWS = {
  intro: { pos: new THREE.Vector3(17, 3.6, 17), look: new THREE.Vector3(-12, 4, -2) },
  deck: { pos: new THREE.Vector3(0, 9, 22), look: new THREE.Vector3(0, 4, -20) },
}

export default function CameraRig({ view = 'intro' }) {
  const { camera, pointer } = useThree()
  const look = useRef(VIEWS.intro.look.clone())
  const tmpPos = useRef(new THREE.Vector3())
  const tmpLook = useRef(new THREE.Vector3())

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const target = VIEWS[view]
    const k = 1 - Math.pow(0.15, delta) // slow, cinematic easing

    tmpPos.current.copy(target.pos)
    tmpPos.current.x += pointer.x * 2.5
    tmpPos.current.y += pointer.y * 1.2 + Math.sin(t * 0.7) * 0.25
    camera.position.lerp(tmpPos.current, k)

    tmpLook.current.copy(target.look)
    tmpLook.current.x += pointer.x * 4
    look.current.lerp(tmpLook.current, k)
    camera.lookAt(look.current)
    camera.rotation.z += Math.sin(t * 0.5) * 0.004 // tiny roll, like standing on a boat
  })

  return null
}
