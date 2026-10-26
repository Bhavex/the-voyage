import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OPEN_SEA } from '../config/palette'

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww; // always at the far plane
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uZenith, uMid, uHorizon, uSun, uCloudLight, uCloudShadow, uSunDir;
  varying vec3 vDir;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.07; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, 0.0, 1.0);

    // Painted three-stop gradient
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
    col = mix(col, uZenith, smoothstep(0.18, 0.75, h));

    // Sun: hard disc plus soft stepped halo
    vec3 sun = normalize(uSunDir);
    float sd = max(dot(d, sun), 0.0);
    float halo = pow(sd, 10.0);
    col = mix(col, uSun, smoothstep(0.0, 1.0, halo) * 0.5);
    col = mix(col, uSun, smoothstep(0.9975, 0.9985, sd));

    // Clouds: projected onto a flat sky ceiling, banded into light and shadow
    if (d.y > 0.0) {
      vec2 uv = d.xz / (d.y + 0.12) * 0.75 + vec2(uTime * 0.004, 0.0);
      float n = fbm(uv);
      float shape = smoothstep(0.54, 0.6, n) * smoothstep(0.0, 0.1, d.y);
      float lit = fbm(uv + sun.xz * 0.12);
      vec3 cloud = mix(uCloudShadow, uCloudLight, smoothstep(n - 0.06, n - 0.02, lit));
      // Sun-facing rims glow warm
      cloud = mix(cloud, uSun, smoothstep(0.55, 0.62, n) * halo * 0.6);
      col = mix(col, cloud, shape);
    }

    // Below the horizon, fade into haze so the sea edge is soft
    if (d.y < 0.0) col = uHorizon;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const c = (hex) => new THREE.Color(hex)

export default function Sky() {
  const mat = useRef()
  const mesh = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uZenith: { value: c(OPEN_SEA.skyZenith) },
      uMid: { value: c(OPEN_SEA.skyMid) },
      uHorizon: { value: c(OPEN_SEA.skyHorizon) },
      uSun: { value: c(OPEN_SEA.sun) },
      uCloudLight: { value: c(OPEN_SEA.cloudLight) },
      uCloudShadow: { value: c(OPEN_SEA.cloudShadow) },
      uSunDir: { value: new THREE.Vector3(...OPEN_SEA.sunDir) },
    }),
    []
  )

  useFrame(({ clock, camera }) => {
    if (!mat.current || !mesh.current) return
    mat.current.uniforms.uTime.value = clock.elapsedTime
    mesh.current.position.copy(camera.position) // sky travels with the viewer
  })

  return (
    <mesh ref={mesh} name="sky" frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[900, 48, 24]} />
      <shaderMaterial
        ref={mat}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}
