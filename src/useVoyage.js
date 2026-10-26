import { useCallback, useEffect, useRef, useState } from 'react'
import { createSailingState } from './world/sailing'
import { filmObjective } from './world/film/objectives'
import { createCaptain } from './world/film/movement'

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
  const [watched, setWatched] = useState(false)
  useEffect(() => { if (film === 'playing' || film === 'soon') setWatched(true) }, [film])
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
      setReel('rack')
      setWatched(false)
      setFilm('idle')
      setAwardOpen(false)
      setFocus('dock')
    }
  }, [])
  const interact = useCallback((id) => {
    if (mode !== 'island' || awardOpen) return
    if (id === 'dock') changeMode('departure')
    if (id === 'lighthouse') setAwardOpen(true)
    if (id === 'rack') {
      if (reel === 'rack') { setReel('carrying'); setMessage('Reel picked up. Take it to the projector.') }
      else setMessage(reel === 'carrying' ? 'You are carrying the reel.' : 'The reel is in the projector.')
    }
    if (id === 'projector') {
      if (reel === 'rack') { setMessage('Pick up a reel from the rack first.'); return }
      if (film === 'playing' || film === 'soon' || film === 'loading') { setFilm('stopped'); return }
      setMessage('')
      setReel('loaded')
      setFilm('loading')
      setPlayRequest((request) => request + 1)
    }
  }, [mode, awardOpen, changeMode, reel, film])
  return { bearingElement, objective, mode, changeMode, touch, ship, captain, trip, videoRef, status, setStatus, nearby, setNearby,
    focus, setFocus, reel, film, setFilm, playRequest, awardOpen, setAwardOpen, message, interact }
}
