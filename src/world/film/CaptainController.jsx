import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { roomWalkable, ROOM_LANDMARKS } from './room'
import { LANDMARKS } from './layout'
import { nearestInteraction, stepCaptain } from './movement'

export default function CaptainController({ game }) {
  const { gl } = useThree()
  const latest = useRef(game)
  latest.current = game
  const keys = useRef({})
  const drag = useRef({ id: null, x: 0, y: 0 })
  const previous = useRef(null)
  const orbit = useRef({ elapsed: 1, freeLook: false, movementYaw: 0 })
  useEffect(() => {
    if (!['island', 'lighthouse'].includes(game.mode) || game.touch || game.awardOpen || game.viewer) return
    const canvas = gl.domElement
    const reset = () => { keys.current = {}; drag.current.id = null; orbit.current.freeLook = false; orbit.current.elapsed = 1 }
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
      orbit.current.movementYaw = orbit.current.freeLook ? orbit.current.movementYaw : latest.current.trip.current.yaw
      orbit.current.freeLook = true
      orbit.current.elapsed = 0
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
      canvas.setPointerCapture(event.pointerId)
    }
    const move = (event) => {
      if (event.pointerId !== drag.current.id) return
      orbit.current.elapsed = 0
      latest.current.trip.current.yaw += (drag.current.x - event.clientX) * 0.005
      latest.current.trip.current.pitch = Math.max(-0.35, Math.min(0.45, latest.current.trip.current.pitch + (drag.current.y - event.clientY) * 0.003))
      drag.current.x = event.clientX
      drag.current.y = event.clientY
    }
    const endDrag = () => { if (drag.current.id !== null) orbit.current.elapsed = 0; drag.current.id = null }
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
  }, [game.mode, game.touch, game.awardOpen, game.viewer, gl])
  useFrame((_, delta) => {
    if (!['island', 'lighthouse'].includes(game.mode) || game.mode !== game.trip.current.mode || game.touch) { previous.current = null; return }
    orbit.current.elapsed += Math.min(delta, 0.25)
    if (!game.awardOpen && !game.viewer) {
      const captain = game.captain.current
      const trip = game.trip.current
      if (keys.current.KeyW && drag.current.id === null && orbit.current.elapsed >= 0.8) {
        const error = Math.atan2(Math.sin(captain.heading - trip.yaw), Math.cos(captain.heading - trip.yaw))
        trip.yaw += Math.sign(error) * Math.min(Math.abs(error) * (1 - Math.exp(-delta * 5)), 2.5 * delta)
        if (Math.abs(error) < 0.015) orbit.current.freeLook = false
      }
      stepCaptain(captain, keys.current, orbit.current.freeLook ? orbit.current.movementYaw : trip.yaw, delta, game.mode === 'lighthouse' ? roomWalkable : undefined)
    }
    else game.captain.current.moving = false
    const nearest = nearestInteraction(game.captain.current, game.mode === 'lighthouse' ? ROOM_LANDMARKS : LANDMARKS)
    if (previous.current !== nearest) {
      previous.current = nearest
      game.setNearby(nearest)
    }
  }, -2)
  return null
}
