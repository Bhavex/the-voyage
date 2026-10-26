import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OPEN_SEA } from '../../config/palette'

function paintedCard(title, subtitle) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 576
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = OPEN_SEA.skyHorizon
  ctx.fillRect(0, 0, 1024, 576)
  ctx.fillStyle = OPEN_SEA.fog
  for (let i = 0; i < 35; i++) ctx.fillRect(0, i * 18, 1024, 4 + i % 5)
  ctx.strokeStyle = OPEN_SEA.oceanDeep
  ctx.lineWidth = 5
  ctx.strokeRect(30, 30, 964, 516)
  ctx.fillStyle = OPEN_SEA.oceanDeep
  ctx.textAlign = 'center'
  ctx.font = 'italic 28px Georgia'
  ctx.fillText('THE FILM ISLAND PICTURE HOUSE', 512, 140)
  ctx.font = 'bold 58px Georgia'
  ctx.fillText('Qile Ki Kasak', 512, 260)
  ctx.font = '30px Georgia'
  ctx.fillText(title, 512, 350)
  ctx.font = '22px Georgia'
  ctx.fillText(subtitle, 512, 412)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export default function FilmScreen({ game, model }) {
  const { film, playRequest, setFilm, videoRef } = game
  const token = useRef(0)
  const [videoTexture, setVideoTexture] = useState(null)
  const video = useMemo(() => {
    const element = document.createElement('video')
    element.playsInline = true
    element.muted = true
    element.preload = 'metadata'
    return element
  }, [])
  const card = useMemo(() => paintedCard(
    film === 'soon' ? 'Film coming soon' : film === 'loading' ? 'Threading the projector…' : 'A story waiting to be told',
    film === 'soon' ? 'The reel is here. The film will arrive soon.' : 'Bring a reel to the projector to begin.',
  ), [film])
  useEffect(() => () => card.dispose(), [card])
  useEffect(() => {
    videoRef.current = video
    return () => {
      videoRef.current = null
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [video, videoRef])
  useEffect(() => {
    if (film === 'idle' || film === 'stopped') { token.current++; video.pause() }
  }, [film, video])
  useEffect(() => {
    if (!playRequest) return
    const request = ++token.current
    const controller = new AbortController()
    let texture
    const current = () => token.current === request
    const unavailable = () => { if (current()) setFilm('soon') }
    const ready = async () => {
      if (!current()) return
      texture = new THREE.VideoTexture(video)
      texture.colorSpace = THREE.SRGBColorSpace
      setVideoTexture(texture)
      try { await video.play(); if (current()) setFilm('playing') }
      catch { if (current()) setFilm('blocked') }
    }
    const ended = () => { if (current()) setFilm('stopped') }
    video.addEventListener('loadeddata', ready, { once: true })
    video.addEventListener('error', unavailable)
    video.addEventListener('ended', ended)
    fetch('/videos/qile-ki-kasak.mp4', { method: 'HEAD', signal: controller.signal }).then((response) => {
      if (!current()) return
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) { unavailable(); return }
      video.src = '/videos/qile-ki-kasak.mp4'
      video.currentTime = 0
      video.load()
    }).catch((error) => { if (error.name !== 'AbortError') unavailable() })
    return () => {
      controller.abort()
      video.pause()
      video.removeEventListener('loadeddata', ready)
      video.removeEventListener('error', unavailable)
      video.removeEventListener('ended', ended)
      texture?.dispose()
    }
  }, [playRequest, setFilm, video])
  const map = (film === 'playing' || film === 'blocked') && videoTexture ? videoTexture : card
  useEffect(() => {
    // glTF UVs use a top-left origin; procedural PlaneGeometry uses bottom-left.
    map.flipY = !model
    map.needsUpdate = true
  }, [map, model])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide, toneMapped: false }), [map])
  useEffect(() => {
    const screen = model?.scene.getObjectByName('screen')
    const old = screen?.material
    if (screen?.isMesh) screen.material = material
    return () => { if (screen?.isMesh) screen.material = old; material.dispose() }
  }, [model, material])
  return model ? null : <mesh name="screen" position={[4, 8.4, -19.5]} material={material} onClick={(event) => { event.stopPropagation(); if (game.touch) game.setFocus('projector') }}>
    <planeGeometry args={[14, 7.875]} />
  </mesh>
}
