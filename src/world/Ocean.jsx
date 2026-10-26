import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { wavesAsVec4 } from './waves'
import { atmosphere } from './lookBlend'

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec4 uWaves[4];
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vHeight;

  const float G = 9.8;
  const float PI = 3.14159265;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 p = world.xyz;
    vec3 displaced = p;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);

    for (int i = 0; i < 4; i++) {
      vec2 d = uWaves[i].xy;
      float steep = uWaves[i].z;
      float k = 2.0 * PI / uWaves[i].w;
      float c = sqrt(G / k);
      float f = k * (dot(d, p.xz) - c * uTime);
      float a = steep / k;
      displaced.x += d.x * a * cos(f);
      displaced.y += a * sin(f);
      displaced.z += d.y * a * cos(f);
      tangent += vec3(-d.x * d.x * steep * sin(f), d.x * steep * cos(f), -d.x * d.y * steep * sin(f));
      binormal += vec3(-d.x * d.y * steep * sin(f), d.y * steep * cos(f), -d.y * d.y * steep * sin(f));
    }

    vNormal = normalize(cross(binormal, tangent));
    vWorldPos = displaced;
    vHeight = displaced.y;
    gl_Position = projectionMatrix * viewMatrix * vec4(displaced, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSunDir;
  uniform vec3 uDeep, uMid, uShallow, uFoam, uSky, uFog, uSun;
  uniform float uFogNear, uFogFar;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vHeight;
  ${NOISE}

  void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 sun = normalize(uSunDir);

    // Painted brush variation so flat areas never look digital
    float brush = fbm(vWorldPos.xz * 0.08 + vec2(uTime * 0.02, 0.0));

    // Banded (toon) light: three soft steps instead of smooth shading
    float ndl = dot(n, sun) * 0.5 + 0.5 + (brush - 0.5) * 0.25;
    float band = smoothstep(0.42, 0.47, ndl) * 0.5 + smoothstep(0.70, 0.75, ndl) * 0.5;
    vec3 col = mix(uDeep, uMid, band);

    // Crests catch lighter turquoise
    float crest = smoothstep(0.6, 1.8, vHeight + brush * 0.8);
    col = mix(col, uShallow, crest * 0.7);

    // Sky reflection at grazing angles, kept in steps
    float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 4.0);
    col = mix(col, uSky, floor(fres * 3.0) / 3.0 * 0.45);

    // Painted foam lines on the highest crests
    // Only the top of the tallest crests, broken up into painted streaks
    float h01 = clamp((vHeight + 2.4) / 4.8, 0.0, 1.0);
    float foamNoise = fbm(vWorldPos.xz * vec2(0.25, 0.6) - uTime * 0.12);
    float foam = smoothstep(0.80, 0.83, h01 * 0.75 + foamNoise * 0.4);
    float streak = smoothstep(0.55, 0.6, fbm(vWorldPos.xz * 0.9 + uTime * 0.05));
    col = mix(col, uFoam, foam * 0.85 + foam * streak * 0.15);

    // Sun sparkles: hard little glints, not a smooth highlight
    vec3 refl = reflect(-sun, n);
    float spec = pow(max(dot(refl, viewDir), 0.0), 120.0);
    float sparkle = step(0.55, spec * (0.6 + vnoise(vWorldPos.xz * 3.0 + uTime) * 0.8));
    col += uSun * sparkle * 0.9;

    // Distance haze into the horizon colour
    float dist = length(cameraPosition - vWorldPos);
    float fog = smoothstep(uFogNear, uFogFar, dist);
    col = mix(col, uFog, fog);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const FOG_NEAR = 80
const FOG_FAR = 650

export default function Ocean({ size = 1600, segments = 384 }) {
  const mat = useRef()

  const uniforms = useMemo(() => {
    const { colours, sunDir } = atmosphere
    return {
      uTime: { value: 0 },
      uWaves: { value: wavesAsVec4().map((v) => new THREE.Vector4(...v)) },
      uSunDir: { value: sunDir.clone() },
      uDeep: { value: colours.oceanDeep.clone() },
      uMid: { value: colours.oceanMid.clone() },
      uShallow: { value: colours.oceanShallow.clone() },
      uFoam: { value: colours.foam.clone() },
      uSky: { value: colours.skyMid.clone() },
      uSun: { value: colours.sun.clone() },
      uFog: { value: colours.fog.clone() },
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
    }
  }, [])

  useFrame(({ clock }) => {
    if (!mat.current) return
    const u = mat.current.uniforms
    const { colours, sunDir, fogScale } = atmosphere
    u.uTime.value = clock.elapsedTime
    u.uSunDir.value.copy(sunDir)
    u.uDeep.value.copy(colours.oceanDeep)
    u.uMid.value.copy(colours.oceanMid)
    u.uShallow.value.copy(colours.oceanShallow)
    u.uFoam.value.copy(colours.foam)
    u.uSky.value.copy(colours.skyMid)
    u.uSun.value.copy(colours.sun)
    u.uFog.value.copy(colours.fog)
    u.uFogNear.value = FOG_NEAR * fogScale
    u.uFogFar.value = FOG_FAR * fogScale
  })

  return (
    <mesh rotation-x={-Math.PI / 2} name="ocean">
      <planeGeometry args={[size, size, segments, segments]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}
