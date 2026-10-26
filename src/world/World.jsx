import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import Sky from './Sky'
import FollowingOcean from './FollowingOcean'
import SailingController from './SailingController'
import Islands from './Islands'
import Ship from './Ship'
import CameraRig from './CameraRig'
import FilmIslandPresence from './film/FilmIslandPresence'
import IslandDirector from './film/IslandDirector'
import CaptainController from './film/CaptainController'
import IslandCamera from './film/IslandCamera'
import Captain from './film/Captain'
import Mooring from './film/Mooring'
import { OPEN_SEA } from '../config/palette'

export default function World({ game }) {
  const { mode, ship, touch } = game
  const sun = OPEN_SEA.sunDir.map((v) => v * 100)
  const visiting = ['disembark', 'island', 'departure'].includes(mode)
  return (
    <Canvas
      dpr={touch ? 1 : [1, 2]}
      camera={{ fov: 45, near: 0.1, far: 2000, position: [14, 3.2, 10] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[OPEN_SEA.skyHorizon]} />
      <hemisphereLight args={[OPEN_SEA.skyMid, OPEN_SEA.oceanDeep, 0.9]} />
      <directionalLight position={sun} intensity={2.2} color={OPEN_SEA.sun} />
      <fog attach="fog" args={[OPEN_SEA.fog, 180, 850]} />
      <IslandDirector game={game} />
      <SailingController active={mode === 'sailing'} ship={ship} onStatus={game.setStatus} />
      <CaptainController game={game} />
      <Sky />
      <FollowingOcean ship={ship} segments={touch ? 192 : 384} />
      <Islands />
      <FilmIslandPresence game={game} />
      <Ship ship={ship} active={mode !== 'intro'} canSteer={mode === 'sailing'} />
      {visiting && <Mooring game={game} />}
      {visiting && !touch && <Captain game={game} />}
      <CameraRig view={mode === 'sailing' ? 'deck' : mode} ship={ship} />
      <IslandCamera game={game} />
      {!touch && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.45} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
          <Vignette offset={0.3} darkness={0.45} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
