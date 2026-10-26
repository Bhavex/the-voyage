import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { OPEN_SEA } from '../../config/palette'

export function useToonPalette() {
  const resources = useMemo(() => {
    const gradient = new THREE.DataTexture(new Uint8Array([105, 185, 255]), 3, 1, THREE.RedFormat)
    gradient.minFilter = gradient.magFilter = THREE.NearestFilter
    gradient.needsUpdate = true
    const materials = Object.fromEntries(Object.entries(OPEN_SEA)
      .filter(([, color]) => typeof color === 'string')
      .map(([name, color]) => [name, new THREE.MeshToonMaterial({ color, gradientMap: gradient })]))
    return { gradient, materials }
  }, [])
  useEffect(() => () => {
    resources.gradient.dispose()
    Object.values(resources.materials).forEach((material) => material.dispose())
  }, [resources])
  return resources.materials
}
