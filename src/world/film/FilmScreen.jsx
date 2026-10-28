import { useEffect, useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ISLAND_PALETTES } from '../../config/palette'
import { CINEMA } from '../../config/cinema'
import { FILM_LINKS } from '../../config/links'

function paintedCard(title, subtitle) {
  const p = ISLAND_PALETTES.film.land
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 576
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = p.walls; ctx.fillRect(0, 0, 1024, 576)
  ctx.fillStyle = p.sand
  ctx.globalAlpha = 0.2
  for (let i = 0; i < 35; i++) ctx.fillRect(0, i * 18, 1024, 4 + i % 5)
  ctx.globalAlpha = 1
  ctx.strokeStyle = p.wood; ctx.lineWidth = 3; ctx.strokeRect(26, 26, 972, 524)
  ctx.fillStyle = p.trim; ctx.textAlign = 'center'
  ctx.font = '22px Georgia'; ctx.fillText('THE FILM ISLAND PICTURE HOUSE', 512, 130)
  ctx.font = 'bold 72px Georgia'; ctx.fillText(CINEMA.title, 512, 255)
  ctx.font = 'italic 34px Georgia'; ctx.fillText(title, 512, 355)
  ctx.font = '23px Georgia'; ctx.fillText(subtitle, 512, 415)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function EndCard() {
  return <Html transform position={[4, 8.4, -19.44]} distanceFactor={8.75} zIndexRange={[20, 10]}>
    <section className="cinema-end-card" aria-label="Cinema end card">
      <p className="eyebrow">The story continues</p>
      <h2>Qile Ki Kasak</h2>
      <p className="cinema-honour">Overall Best Film, INTACH Filmit India</p>
      <a className="cinema-watch" href={FILM_LINKS.qileKiKasak.url} target="_blank" rel="noopener noreferrer">{FILM_LINKS.qileKiKasak.label} ↗</a>
      <nav aria-label="Filmmaker profiles">{FILM_LINKS.profiles.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}</nav>
    </section>
  </Html>
}

export default function FilmScreen({ game, model }) {
  const { film, playRequest, setFilm, videoRef } = game
  const active = game.mode === 'island'
  const token = useRef(0)
  const latestFilm = useRef(film)
  latestFilm.current = film
  const [videoTexture, setVideoTexture] = useState(null)
  const [poster, setPoster] = useState(null)
  const video = useMemo(() => {
    const element = document.createElement('video')
    element.playsInline = true; element.muted = true; element.preload = 'none'
    element.poster = CINEMA.poster
    return element
  }, [])
  const card = useMemo(() => paintedCard(
    film === 'soon' ? 'Coming soon' : film === 'loading' ? 'Threading the projector…' : 'Filmmaking, editing & the stories between',
    film === 'soon' ? 'A new reel of stories is on its way.' : 'Bring The Director to the projector to begin.',
  ), [film])
  useEffect(() => () => card.dispose(), [card])
  useEffect(() => {
    let cancelled = false
    const texture = new THREE.TextureLoader().load(CINEMA.poster, (loaded) => {
      if (!cancelled) { loaded.colorSpace = THREE.SRGBColorSpace; setPoster(loaded) }
    }, undefined, () => {})
    return () => { cancelled = true; texture.dispose() }
  }, [])
  useEffect(() => {
    if (!active) return
    videoRef.current = video
    return () => { videoRef.current = null; video.pause(); video.removeAttribute('src'); video.load() }
  }, [active, video, videoRef])
  useEffect(() => {
    if (['idle', 'stopped', 'paused'].includes(film)) video.pause()
    if (['idle', 'stopped'].includes(film)) token.current++
  }, [film, video])
  useEffect(() => {
    if (!active || !playRequest || latestFilm.current !== 'loading') return
    const request = ++token.current
    const controller = new AbortController()
    let texture
    let cancelled = false
    const current = () => !cancelled && token.current === request
    const unavailable = () => { if (current()) setFilm('soon') }
    const ready = async () => {
      if (!current()) return
      texture = new THREE.VideoTexture(video); texture.colorSpace = THREE.SRGBColorSpace
      setVideoTexture(texture)
      try { await video.play(); if (current()) setFilm('playing') }
      catch { if (current()) setFilm('blocked') }
    }
    const ended = () => { if (current()) setFilm('ended') }
    video.addEventListener('loadeddata', ready, { once: true })
    video.addEventListener('error', unavailable)
    video.addEventListener('ended', ended)
    // No request is made from the sea, fly-in, lighthouse, or before loading the reel.
    fetch(CINEMA.video, { method: 'HEAD', signal: controller.signal }).then((response) => {
      if (!current()) return
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) { unavailable(); return }
      video.src = CINEMA.video; video.currentTime = 0; video.load()
    }).catch((error) => { if (error.name !== 'AbortError') unavailable() })
    return () => {
      cancelled = true; controller.abort(); video.pause()
      video.removeEventListener('loadeddata', ready); video.removeEventListener('error', unavailable); video.removeEventListener('ended', ended)
      texture?.dispose(); setVideoTexture(null)
    }
  }, [active, playRequest, setFilm, video])
  const showingVideo = ['playing', 'paused', 'blocked'].includes(film)
  const map = showingVideo && videoTexture ? videoTexture : ['soon', 'loading'].includes(film) ? card : poster ?? card
  useEffect(() => { map.flipY = !model; map.needsUpdate = true }, [map, model])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide, toneMapped: false }), [map])
  useEffect(() => {
    const screen = model?.scene.getObjectByName('screen'), old = screen?.material
    if (screen?.isMesh) screen.material = material
    return () => { if (screen?.isMesh) screen.material = old; material.dispose() }
  }, [model, material])
  return <>
    {!model && <mesh name="screen" position={[4, 8.4, -19.5]} material={material} onClick={(event) => { event.stopPropagation(); if (game.touch) game.setFocus('projector') }}><planeGeometry args={[14, 7.875]} /></mesh>}
    {active && film === 'ended' && <EndCard />}
  </>
}
