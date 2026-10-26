import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import Sky from './Sky'
import FollowingOcean from './FollowingOcean'
import SailingController from './SailingController'
import Islands from './Islands'
import Ship from './Ship'
import CameraRig from './CameraRig'
import { OPEN_SEA } from '../config/palette'

export default function World({ view, ship, onStatus, quality = 'high' }) {
  const sun = OPEN_SEA.sunDir.map((v) => v * 100)

  return (
    <Canvas
      dpr={quality === 'low' ? 1 : [1, 2]}
      camera={{ fov: 45, near: 0.1, far: 2000, position: [14, 3.2, 10] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[OPEN_SEA.skyHorizon]} />
      <hemisphereLight args={[OPEN_SEA.skyMid, OPEN_SEA.oceanDeep, 0.9]} />
      <directionalLight position={sun} intensity={2.2} color={OPEN_SEA.sun} />

      <fog attach="fog" args={[OPEN_SEA.fog, 180, 850]} />
      <SailingController active={view === 'deck'} ship={ship} onStatus={onStatus} />
      <Sky />
      <FollowingOcean ship={ship} segments={quality === 'low' ? 192 : 384} />
      <Islands />
      <Ship ship={ship} active={view === 'deck'} />
      <CameraRig view={view} ship={ship} />

      {quality !== 'low' && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.45} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
          <Vignette offset={0.3} darkness={0.45} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
