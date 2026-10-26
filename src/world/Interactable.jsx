import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OPEN_SEA } from '../config/palette'

// Shared proximity/tap marker: any island can supply a landmark and an action.
export default function Interactable({ landmark, model, highlighted, touch, onSelect }) {
  const glow = useRef()
  const { scene } = useThree()
  useEffect(() => {
    if (!highlighted) return
    const target = scene.getObjectByName(landmark.target)
    const originals = []
    target?.traverse((object) => {
      if (!object.isMesh) return
      const original = object.material
      const brighten = (material) => {
        const copy = material.clone()
        if (copy.emissive) { copy.emissive.set(OPEN_SEA.sun); copy.emissiveIntensity = 0.25 }
        return copy
      }
      object.material = Array.isArray(original) ? original.map(brighten) : brighten(original)
      originals.push([object, original, object.material])
    })
    return () => originals.forEach(([object, original, copies]) => {
      object.material = original
      ;(Array.isArray(copies) ? copies : [copies]).forEach((copy) => copy.dispose())
    })
  }, [highlighted, landmark.target, model, scene])
  useFrame(({ clock }, delta) => {
    const target = highlighted ? 0.5 + Math.sin(clock.elapsedTime * 2) * 0.12 : touch ? 0.12 : 0
    glow.current.material.opacity += (target - glow.current.material.opacity) * (1 - Math.exp(-delta * 8))
  })
  return <group name={`interact_${landmark.id}`} position={landmark.position} onClick={(event) => {
    event.stopPropagation()
    if (touch) onSelect(landmark.id)
  }}>
    <mesh ref={glow} rotation-x={-Math.PI / 2} position-y={0.08}>
      <ringGeometry args={[1.15, 1.6, 40]} />
      <meshBasicMaterial color={OPEN_SEA.sun} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh position-y={1.4}>
      <cylinderGeometry args={[1.8, 1.8, 3, 16]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  </group>
}
