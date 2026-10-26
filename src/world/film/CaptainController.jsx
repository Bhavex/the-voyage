import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { LANDMARKS } from './layout'
import { nearestInteraction, stepCaptain } from './movement'

export default function CaptainController({ game }) {
  const { gl } = useThree()
  const latest = useRef(game)
  latest.current = game
  const keys = useRef({})
  const drag = useRef({ id: null, x: 0, y: 0 })
  const previous = useRef(null)
  useEffect(() => {
    if (game.mode !== 'island' || game.touch || game.awardOpen) return
    const canvas = gl.domElement
    const reset = () => { keys.current = {}; drag.current.id = null }
    const down = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.code === 'KeyE' && !event.repeat) {
        event.preventDefault()
        latest.current.interact(latest.current.nearby)
      }
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(event.code)) {
        event.preventDefault()
        keys.current[event.code] = true
      }
    }
    const up = (event) => { keys.current[event.code] = false }
    const startDrag = (event) => {
      if (event.button !== 0) return
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
      canvas.setPointerCapture(event.pointerId)
    }
    const move = (event) => {
      if (event.pointerId !== drag.current.id) return
      latest.current.trip.current.yaw += (drag.current.x - event.clientX) * 0.005
      latest.current.trip.current.pitch = Math.max(-0.15, Math.min(0.8, latest.current.trip.current.pitch + (drag.current.y - event.clientY) * 0.003))
      drag.current.x = event.clientX
      drag.current.y = event.clientY
    }
    const endDrag = () => { drag.current.id = null }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    canvas.addEventListener('pointerdown', startDrag)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    return () => {
      reset()
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', reset)
      canvas.removeEventListener('pointerdown', startDrag)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [game.mode, game.touch, game.awardOpen, gl])
  useFrame((_, delta) => {
    if (game.mode !== 'island' || game.mode !== game.trip.current.mode || game.touch) { previous.current = null; return }
    if (!game.awardOpen) stepCaptain(game.captain.current, keys.current, game.trip.current.yaw, delta)
    else game.captain.current.moving = false
    const nearest = nearestInteraction(game.captain.current, LANDMARKS)
    if (previous.current !== nearest) {
      previous.current = nearest
      game.setNearby(nearest)
    }
  }, -2)
  return null
}
