import * as THREE from 'three'
import { CONFIG } from '../../config'

// Shader code
const vertexShader = `
uniform sampler2D map;
uniform sampler2D depthMap;
uniform float depthScale;
uniform float yaw;
uniform float pitch;

varying vec2 vUv;

void main() {
  vUv = uv;

  // Sample depth map
  float depth = texture2D(depthMap, uv).r;

  // Convert angles to radians
  float yawRad = yaw * 3.14159265359 / 180.0;
  float pitchRad = pitch * 3.14159265359 / 180.0;

  // Calculate parallax strength from depth (range -1 to 1)
  float parallaxStrength = (depth - 0.5) * 2.0;

  // Apply displacement based on rotation and depth
  vec3 pos = position;
  pos.x += sin(yawRad) * parallaxStrength * depthScale * 2.0;
  pos.y -= sin(pitchRad) * parallaxStrength * depthScale * 2.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = `
uniform sampler2D map;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(map, vUv);
  gl_FragColor = color;
}
`

export interface SceneState {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  mesh: THREE.Mesh
  material: THREE.ShaderMaterial
  dispose: () => void
}

export interface SceneConfig {
  portraitWidth: number
  portraitHeight: number
  initialSubdivisions?: number
}

/**
 * Create Three.js scene with depth-based parallax plane
 */
export function createScene(
  container: HTMLDivElement,
  portraitTexture: THREE.Texture,
  depthTexture: THREE.Texture,
  config: SceneConfig
): SceneState {
  const { portraitWidth, portraitHeight, initialSubdivisions = CONFIG.meshSubdivisions } = config

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a1a)

  // Camera
  const aspect = container.clientWidth / container.clientHeight
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
  camera.position.z = 1

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  // Geometry
  const geometry = new THREE.PlaneGeometry(1, 1, initialSubdivisions, initialSubdivisions)

  // Material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: portraitTexture },
      depthMap: { value: depthTexture },
      depthScale: { value: CONFIG.depthScale },
      yaw: { value: 0 },
      pitch: { value: 0 }
    },
    vertexShader,
    fragmentShader
  })

  // Mesh
  const mesh = new THREE.Mesh(geometry, material)

  // Scale mesh to match portrait aspect ratio so the image is not stretched
  if (portraitWidth > 0 && portraitHeight > 0) {
    const aspect = portraitWidth / portraitHeight
    if (aspect >= 1) {
      mesh.scale.set(aspect, 1, 1)
    } else {
      mesh.scale.set(1, 1 / aspect, 1)
    }
  }

  scene.add(mesh)

  // Handle resize with debouncing and validation
  let resizeTimeout: number | undefined
  const handleResize = () => {
    if (resizeTimeout !== undefined) {
      clearTimeout(resizeTimeout)
    }

    resizeTimeout = window.setTimeout(() => {
      const width = container.clientWidth
      const height = container.clientHeight

      // Only resize if dimensions are valid (greater than 0)
      if (width > 0 && height > 0) {
        console.log('[createScene] Resizing renderer to', width, 'x', height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      } else {
        console.warn('[createScene] Invalid container dimensions on resize:', width, 'x', height)
      }

      resizeTimeout = undefined
    }, 100) // Debounce by 100ms to avoid rapid updates
  }
  window.addEventListener('resize', handleResize)

  const dispose = () => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimeout !== undefined) {
      clearTimeout(resizeTimeout)
      resizeTimeout = undefined
    }
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
    renderer.dispose()
    material.dispose()
    mesh.geometry.dispose()
    portraitTexture.dispose()
    depthTexture.dispose()
  }

  return {
    scene,
    camera,
    renderer,
    mesh,
    material,
    dispose
  }
}

/**
 * Update mesh subdivisions for performance
 */
export function updateMeshSubdivisions(
  mesh: THREE.Mesh,
  subdivisions: number
): void {
  const geometry = new THREE.PlaneGeometry(1, 1, subdivisions, subdivisions)
  mesh.geometry.dispose()
  mesh.geometry = geometry
}

