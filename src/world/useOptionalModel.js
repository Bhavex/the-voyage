import { useEffect, useState } from 'react'

const cache = new Map()

// Vite serves index.html for unknown files; validate GLB magic instead of status alone.
async function loadModel(url) {
  try {
    const response = await fetch(url)
    if (!response.ok || response.headers.get('content-type')?.includes('text/html')) return null
    const bytes = await response.arrayBuffer()
    if (bytes.byteLength < 12 || new DataView(bytes).getUint32(0, true) !== 0x46546c67) return null
    const [{ GLTFLoader }, { clone }, { MeshoptDecoder }] = await Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/utils/SkeletonUtils.js'),
      import('three/examples/jsm/libs/meshopt_decoder.module.js'),
    ])
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes, new URL('.', new URL(url, window.location.href)).href)
    return { gltf, clone }
  } catch {
    return null
  }
}

export function useOptionalModel(url, requiredNames = '') {
  const [model, setModel] = useState(null)
  useEffect(() => {
    let active = true
    if (!cache.has(url)) cache.set(url, loadModel(url))
    cache.get(url).then((loaded) => {
      if (!active || !loaded) return
      const scene = loaded.clone(loaded.gltf.scene)
      if (requiredNames.split(' ').filter(Boolean).some((part) => {
        const [name, type] = part.split(':')
        const object = scene.getObjectByName(name)
        return !object || (type === 'mesh' && !object.isMesh)
      })) return
      setModel({ scene, animations: loaded.gltf.animations })
    })
    return () => { active = false }
  }, [url, requiredNames])
  return model
}
