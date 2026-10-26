import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FILM_ISLAND, worldPosition } from './layout'

export default function FilmBearing({ game }) {
  const { camera, size } = useThree()
  const point = useMemo(() => new THREE.Vector3(), [])
  const view = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const element = game.bearingElement.current
    if (!element || game.mode !== 'sailing' || game.touch) return
    camera.updateMatrixWorld()
    point.set(...worldPosition(0, 5, 0))
    view.copy(point).applyMatrix4(camera.matrixWorldInverse)
    point.project(camera)
    let x = point.x, y = -point.y
    if (view.z > 0) { x = -x; y = -y }
    if (Math.abs(x) + Math.abs(y) < 0.001) y = -1
    const halfWidth = size.width / 2 - 85, halfHeight = size.height / 2 - 55
    const factor = 1 / Math.max(Math.abs(x), Math.abs(y))
    element.style.left = `${size.width / 2 + x * factor * halfWidth}px`
    element.style.top = `${size.height / 2 + y * factor * halfHeight}px`
    element.firstElementChild.style.transform = `rotate(${Math.atan2(y, x) + Math.PI / 2}rad)`
    const distance = Math.round(Math.hypot(game.ship.current.x - FILM_ISLAND.position[0], game.ship.current.z - FILM_ISLAND.position[1]))
    element.lastElementChild.textContent = `Film Island · ${distance} m`
  })
  return null
}
