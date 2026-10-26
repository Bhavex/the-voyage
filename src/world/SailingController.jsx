import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { changeSail, clearSailingInput, nearbyIsland, stepSailing } from './sailing'

export default function SailingController({ active, ship, onStatus }) {
  const previous = useRef('')

  useEffect(() => {
    if (!active) return
    const state = ship.current
    const reset = () => clearSailingInput(state)
    const keyDown = (event) => {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (!['KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(event.code)) return
      event.preventDefault()
      if (event.code === 'KeyA') state.left = true
      if (event.code === 'KeyD') state.right = true
      if (!event.repeat && event.code === 'KeyW') changeSail(state, 1)
      if (!event.repeat && event.code === 'KeyS') changeSail(state, -1)
    }
    const keyUp = (event) => {
      if (event.code === 'KeyA') state.left = false
      if (event.code === 'KeyD') state.right = false
    }
    const pointerMove = (event) => {
      if (state.dragging && event.pointerId === state.pointerId) {
        state.dragSteer = Math.max(-1, Math.min(1, (state.dragStartX - event.clientX) / 90))
      }
    }
    const pointerEnd = (event) => {
      if (event.pointerId === state.pointerId) {
        state.dragging = false
        state.dragSteer = 0
        state.pointerId = null
      }
    }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', reset)
    window.addEventListener('pointermove', pointerMove)
    window.addEventListener('pointerup', pointerEnd)
    window.addEventListener('pointercancel', pointerEnd)
    document.addEventListener('visibilitychange', reset)
    return () => {
      reset()
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', reset)
      window.removeEventListener('pointermove', pointerMove)
      window.removeEventListener('pointerup', pointerEnd)
      window.removeEventListener('pointercancel', pointerEnd)
      document.removeEventListener('visibilitychange', reset)
    }
  }, [active, ship])

  useFrame((_, delta) => {
    if (!active) return
    const state = ship.current
    stepSailing(state, delta)
    const island = nearbyIsland(state)
    const key = `${state.sailLevel}|${state.returning}|${island}`
    if (key !== previous.current) {
      previous.current = key
      onStatus({ sailLevel: state.sailLevel, returning: state.returning, island })
    }
  }, -3)

  return null
}
