import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useOptionalModel } from '../useOptionalModel'
import { ISLAND_PALETTES } from '../../config/palette'
import { FILM_ISLAND, GROUND_Y } from './layout'
import { useToonPalette } from './materials'
import { Block, Reel } from './Primitives'

const FILM_PALETTE = ISLAND_PALETTES.film.land

export default function Captain({ game }) {
  const root = useRef()
  const legs = useRef()
  const m = useToonPalette()
  const reelMaterial = useMemo(() => new THREE.MeshToonMaterial({ color: FILM_PALETTE.accent, gradientMap: m.sun.gradientMap }), [m])
  useEffect(() => () => reelMaterial.dispose(), [reelMaterial])
  const model = useOptionalModel('/models/captain.glb')
  const mixer = useMemo(() => model ? new THREE.AnimationMixer(model.scene) : null, [model])
  const actions = useMemo(() => model ? Object.fromEntries(model.animations.map((clip) => [clip.name.toLowerCase(), mixer.clipAction(clip)])) : {}, [model, mixer])
  const currentAction = useRef(null)
  useEffect(() => () => { mixer?.stopAllAction(); if (model) mixer?.uncacheRoot(model.scene) }, [model, mixer])
  useFrame((_, delta) => {
    const captain = game.captain.current
    root.current.visible = game.mode !== 'departure' || game.trip.current.elapsed < 2
    const height = ['island', 'lighthouse'].includes(game.mode) ? GROUND_Y : THREE.MathUtils.lerp(game.ship.current.y + 1.4, GROUND_Y, THREE.MathUtils.clamp(1 - captain.x / 8, 0, 1))
    root.current.position.set(FILM_ISLAND.position[0] + captain.x, height, FILM_ISLAND.position[1] + captain.z)
    root.current.rotation.y = captain.heading
    const motion = captain.moving ? (captain.running ? 'run' : 'walk') : 'idle'
    if (mixer) {
      const next = actions[motion] ?? actions.idle
      if (next !== currentAction.current) {
        currentAction.current?.fadeOut(0.2)
        next?.reset().fadeIn(0.2).play()
        currentAction.current = next
      }
      mixer.update(delta)
    }
    if (legs.current) {
      const stride = captain.moving ? Math.sin(performance.now() * (captain.running ? 0.014 : 0.009)) * 0.45 : 0
      legs.current.children[0].rotation.x = stride
      legs.current.children[1].rotation.x = -stride
    }
  }, -1)
  return <group ref={root} name="captain">
    {model ? <primitive object={model.scene} /> : <group name="captain_placeholder">
      <group ref={legs} position-y={0.7}>
        {[-0.22, 0.22].map((x) => <group key={x} position-x={x}>
          <Block position-y={-0.32} scale={[0.28, 0.65, 0.3]} material={m.oceanDeep} />
          <Block position={[0, -0.6, -0.08]} scale={[0.32, 0.2, 0.48]} material={m.oceanDeep} />
        </group>)}
      </group>
      <mesh name="coat" position-y={1.18} material={m.skyZenith}><cylinderGeometry args={[0.36, 0.6, 1.2, 24]} /></mesh>
      <Block position={[0, 1.4, -0.34]} scale={[0.28, 0.65, 0.12]} material={m.sun} />
      <mesh name="head" position-y={2.03} scale={[0.32, 0.39, 0.32]} material={m.skyHorizon}><sphereGeometry args={[1, 24, 16]} /></mesh>
      <group name="hat" position-y={2.3}>
        <mesh material={m.oceanDeep}><cylinderGeometry args={[0.58, 0.58, 0.12, 32]} /></mesh>
        <mesh position-y={0.15} material={m.oceanDeep}><cylinderGeometry args={[0.33, 0.38, 0.32, 32]} /></mesh>
        <mesh position-y={0.05} material={m.sun}><cylinderGeometry args={[0.385, 0.385, 0.08, 32]} /></mesh>
      </group>
      {[-1, 1].map((side) => <group key={side} position={[side * 0.47, 1.38, 0]} rotation-z={side * 0.15} rotation-x={game.reel === 'carrying' ? 1 : 0}>
        <Block position-y={-0.12} scale={[0.25, 0.7, 0.28]} material={m.skyZenith} />
        <mesh position-y={-0.5} material={m.skyHorizon}><sphereGeometry args={[0.15, 16, 12]} /></mesh>
      </group>)}
    </group>}
    {game.reel === 'carrying' && <Reel name="carried_reel" position={[0, 1.15, -0.5]} scale={1.2} material={reelMaterial} />}
  </group>
}
