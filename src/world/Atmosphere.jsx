import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { atmosphere, blendAtmosphere } from './lookBlend'
import { OPEN_SEA } from '../config/palette'

// Owns the scene fog, background and lights, and refreshes the shared atmosphere once per frame
// (before Ocean and Sky read it) from where the ship is.
export const FOG_NEAR = 180
export const FOG_FAR = 850

export default function Atmosphere({ ship }) {
  const background = useRef()
  const hemisphere = useRef()
  const sun = useRef()
  const fog = useRef()
  useFrame(() => {
    const { colours, sunDir, fogScale, light } = blendAtmosphere(atmosphere, ship.current.x, ship.current.z)
    background.current.copy(colours.skyHorizon)
    hemisphere.current.color.copy(colours.skyMid)
    hemisphere.current.groundColor.copy(colours.oceanDeep)
    hemisphere.current.intensity = 0.9 * light
    sun.current.color.copy(colours.sun)
    sun.current.intensity = 2.2 * light
    sun.current.position.copy(sunDir).multiplyScalar(100)
    fog.current.color.copy(colours.fog)
    fog.current.near = FOG_NEAR * fogScale
    fog.current.far = FOG_FAR * fogScale
  }, -5)
  return <>
    <color ref={background} attach="background" args={[OPEN_SEA.skyHorizon]} />
    <hemisphereLight ref={hemisphere} args={[OPEN_SEA.skyMid, OPEN_SEA.oceanDeep, 0.9]} />
    <directionalLight ref={sun} position={OPEN_SEA.sunDir.map((v) => v * 100)} intensity={2.2} color={OPEN_SEA.sun} />
    <fog ref={fog} attach="fog" args={[OPEN_SEA.fog, FOG_NEAR, FOG_FAR]} />
  </>
}
