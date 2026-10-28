import { useCallback, useEffect, useRef, useState } from 'react'
import { createSailingState } from './world/sailing'
import { filmObjective } from './world/film/objectives'
import { createCaptain } from './world/film/movement'
import { ROOM_SPAWN } from './world/film/room'

export default function useVoyage() {
  const [mode, setMode] = useState('intro')
  const [touch] = useState(() => navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches)
  const videoRef = useRef(null)
  const bearingElement = useRef(null)
  const ship = useRef(createSailingState())
  const captain = useRef(createCaptain())
  const trip = useRef({ mode: 'intro', elapsed: 0, canArrive: true, yaw: 0, pitch: 0 })
  const [status, setStatus] = useState({ sailLevel: 0, returning: false, island: '' })
  const [nearby, setNearby] = useState(null)
  const [focus, setFocus] = useState('dock')
  const [reel, setReel] = useState('rack')
  const [film, setFilm] = useState('idle')
  const [playRequest, setPlayRequest] = useState(0)
  const [awardOpen, setAwardOpen] = useState(false)
  const [viewer, setViewer] = useState(null)
  const [watched, setWatched] = useState(false)
  useEffect(() => { if (['playing', 'soon', 'ended'].includes(film)) setWatched(true) }, [film])
  const objective = filmObjective(reel, film, watched)
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4500)
    return () => clearTimeout(timer)
  }, [message])
  const changeMode = useCallback((next) => {
    trip.current.elapsed = 0
    trip.current.mode = next
    setNearby(null)
    setMode(next)
    if (next === 'arrival') setFocus('dock')
    if (next === 'departure') {
      setReel('rack'); setWatched(false); setFilm('idle'); setAwardOpen(false); setViewer(null); setFocus('dock')
    }
  }, [])
  const leaveRoom = useCallback(() => {
    Object.assign(captain.current, createCaptain(), { x: 22, z: -1.8, heading: Math.PI })
    trip.current.yaw = Math.PI
    trip.current.pitch = 0
    setAwardOpen(false); setViewer(null)
    setFocus('lighthouse')
    changeMode('island')
  }, [changeMode])
  const playFilm = useCallback(() => {
    setMessage(''); setFilm('loading'); setPlayRequest((request) => request + 1)
  }, [])
  const interact = useCallback((id) => {
    if (awardOpen || viewer) return
    if (mode === 'lighthouse') {
      if (id === 'room-exit') leaveRoom()
      if (id === 'award') setAwardOpen(true)
      return
    }
    if (mode !== 'island') return
    if (id === 'dock') changeMode('departure')
    if (id === 'lighthouse') {
      setFilm((current) => current === 'idle' ? current : 'stopped')
      Object.assign(captain.current, createCaptain(), ROOM_SPAWN)
      trip.current.yaw = 0; trip.current.pitch = 0
      changeMode('lighthouse')
    }
    if (id === 'rack') {
      if (reel === 'rack') { setReel('carrying'); setMessage('The Director picked up. Take it to the projector.') }
      else setMessage(reel === 'carrying' ? 'You are carrying The Director.' : 'The Director is in the projector.')
    }
    if (id === 'projector') {
      if (reel === 'rack') { setMessage('Pick up The Director from the rack first.'); return }
      if (['playing', 'paused', 'soon', 'loading', 'blocked', 'ended'].includes(film)) { setFilm('stopped'); return }
      setReel('loaded'); playFilm()
    }
  }, [mode, awardOpen, viewer, changeMode, leaveRoom, reel, film, playFilm])
  return { bearingElement, objective, mode, changeMode, touch, ship, captain, trip, videoRef, status, setStatus, nearby, setNearby,
    focus, setFocus, reel, film, setFilm, playRequest, playFilm, awardOpen, setAwardOpen, viewer, setViewer, leaveRoom, message, interact }
}
