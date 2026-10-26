import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { waveHeight } from './waves'
import { hullWaveHeight } from './sailing'

// PLACEHOLDER SHIP
// Built from simple shapes so the world can be tested before the Blender
// model exists. Part names (hull, sail_main, wheel, flag) match the names the
// Blender model should use, so swapping in /public/models/ship.glb later is easy.
// The ship's forward direction is -Z.

const SAIL_HEIGHTS = [0.06, 0.5, 1]

function useToonGradient() {
  return useMemo(() => {
    const data = new Uint8Array([90, 170, 255]) // three light bands
    const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat)
    tex.minFilter = tex.magFilter = THREE.NearestFilter
    tex.needsUpdate = true
    return tex
  }, [])
}

function hullGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, 6.2) // bow
  s.quadraticCurveTo(2.3, 3.2, 2.2, -1)
  s.lineTo(1.8, -5)
  s.lineTo(-1.8, -5)
  s.lineTo(-2.2, -1)
  s.quadraticCurveTo(-2.3, 3.2, 0, 6.2)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 1.9,
    bevelEnabled: true,
    bevelSize: 0.25,
    bevelThickness: 0.3,
    bevelSegments: 3,
    curveSegments: 16,
  })
  g.rotateX(-Math.PI / 2) // shape's forward becomes -Z, extrusion goes up
  g.translate(0, -1.3, 0) // sit in the water
  return g
}

function sailGeometry() {
  const g = new THREE.PlaneGeometry(5.2, 5.6, 16, 16)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    // Billow forward, strongest in the middle
    const billow = Math.cos((x / 5.2) * Math.PI) * Math.cos((y / 5.6) * Math.PI * 0.8)
    pos.setZ(i, -billow * 0.9)
  }
  g.computeVertexNormals()
  return g
}

export default function Ship({ ship, active }) {
  const group = useRef()
  const riding = useRef()
  const sail = useRef()
  const flag = useRef()
  const wheel = useRef()
  const gradientMap = useToonGradient()

  const geo = useMemo(() => ({ hull: hullGeometry(), sail: sailGeometry() }), [])

  const mats = useMemo(
    () => ({
      deck: new THREE.MeshToonMaterial({ color: '#c99a5e', gradientMap }),
      hull: new THREE.MeshToonMaterial({ color: '#6b3b26', gradientMap }),
      wood: new THREE.MeshToonMaterial({ color: '#8a5634', gradientMap }),
      // Emissive warmth fakes sunlight glowing through the cloth
      sail: new THREE.MeshToonMaterial({ color: '#fff3e0', emissive: '#c9a27a', emissiveIntensity: 0.55, gradientMap, side: THREE.DoubleSide }),
      trim: new THREE.MeshToonMaterial({ color: '#e7b74c', gradientMap }),
      flag: new THREE.MeshToonMaterial({ color: '#d9534f', gradientMap, side: THREE.DoubleSide }),
    }),
    [gradientMap]
  )

  const smooth = useRef({ y: 0, pitch: 0, roll: 0 })

  useFrame(({ clock }, delta) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    const state = ship.current
    g.position.x = state.x
    g.position.z = state.z
    g.rotation.y = state.heading

    // Sample bow, stern and sides in world space at the current heading.
    const bow = hullWaveHeight(waveHeight, state, 0, -5, t)
    const stern = hullWaveHeight(waveHeight, state, 0, 4.5, t)
    const port = hullWaveHeight(waveHeight, state, -2, 0, t)
    const starboard = hullWaveHeight(waveHeight, state, 2, 0, t)

    const targetY = (bow + stern + port + starboard) / 4
    const targetPitch = Math.atan2(bow - stern, 9.5)
    const targetRoll = Math.atan2(starboard - port, 4)

    // Ease towards the target so the ship feels heavy
    const k = 1 - Math.pow(0.02, delta)
    const s = smooth.current
    s.y += (targetY - s.y) * k
    s.pitch += (targetPitch - s.pitch) * k
    s.roll += (targetRoll - s.roll) * k

    riding.current.position.y = s.y
    riding.current.rotation.x = s.pitch
    riding.current.rotation.z = s.roll
    state.y = s.y

    if (flag.current) flag.current.rotation.y = Math.sin(t * 6) * 0.25
    if (wheel.current) wheel.current.rotation.z = state.steering * 1.3
    if (sail.current) {
      const height = active ? SAIL_HEIGHTS[state.sailLevel] : 1
      sail.current.scale.y = THREE.MathUtils.damp(sail.current.scale.y, height, 3, delta)
      // Keep the top attached to the yard while the cloth gathers upwards.
      sail.current.position.y = 8.5 - 2.8 * sail.current.scale.y
    }
  }, -2)

  const startWheelDrag = (event) => {
    if (!active || event.button !== 0) return
    event.stopPropagation()
    const state = ship.current
    state.dragging = true
    state.dragStartX = event.clientX
    state.dragSteer = 0
    state.pointerId = event.pointerId
    event.target.setPointerCapture(event.pointerId)
  }

  return (
    <group ref={group} name="ship">
      <group ref={riding} name="wave_riding">
        <mesh name="hull" geometry={geo.hull} material={[mats.deck, mats.hull]} />

        {/* Stern cabin */}
        <mesh name="cabin" position={[0, 1.4, 3.3]} material={mats.wood}>
          <boxGeometry args={[3, 1.4, 2.2]} />
        </mesh>
        <mesh position={[0, 2.2, 3.3]} material={mats.trim}>
          <boxGeometry args={[3.2, 0.15, 2.4]} />
        </mesh>

        {/* Mast, yard and sail */}
        <mesh name="mast" position={[0, 5.4, -0.6]} material={mats.wood}>
          <cylinderGeometry args={[0.12, 0.18, 10, 10]} />
        </mesh>
        <mesh name="yard" position={[0, 8.6, -0.75]} rotation-z={Math.PI / 2} material={mats.wood}>
          <cylinderGeometry args={[0.08, 0.08, 5.6, 8]} />
        </mesh>
        <mesh ref={sail} name="sail_main" geometry={geo.sail} position={[0, 5.7, -0.9]} material={mats.sail} />

        {/* Flag at the top of the mast */}
        <group position={[0, 10.4, -0.6]}>
          <mesh ref={flag} name="flag" position={[0.6, 0, 0]} material={mats.flag}>
            <planeGeometry args={[1.2, 0.7]} />
          </mesh>
        </group>

        {/* Raised helm stays visible and reachable from the follow camera. */}
        <mesh position={[0, 2.7, 3.3]} material={mats.wood}>
          <boxGeometry args={[0.25, 1, 0.25]} />
        </mesh>
        <group ref={wheel} name="wheel" position={[0, 3.4, 3.45]} onPointerDown={startWheelDrag}>
          {/* A generous invisible hit area makes the small wheel easy to grab. */}
          <mesh>
            <circleGeometry args={[0.95, 24]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh material={mats.trim}>
            <torusGeometry args={[0.55, 0.06, 8, 24]} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation-z={(i * Math.PI) / 4} material={mats.wood}>
              <boxGeometry args={[1.5, 0.06, 0.06]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
