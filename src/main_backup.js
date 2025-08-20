import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Scene setup
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xffffff)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Add directional light for toon shading
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5, 10, 7.5)
scene.add(light)

// Helper: create gradient texture for cel shading
function generateGradientTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 0, size)
  gradient.addColorStop(0.0, '#ffffff')
  gradient.addColorStop(0.5, '#8888ff')
  gradient.addColorStop(1.0, '#0000ff')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  return texture
}

const gradientTexture = generateGradientTexture()

// Load water video
const video = document.createElement('video')
video.loop = true
video.muted = true
video.src = 'water2.mp4'
video.playbackRate = 0.5
video.play()

// Initial cone parameters
let coneHeight = parseFloat(document.getElementById('heightInput').value)
let coneRadius = parseFloat(document.getElementById('radiusInput').value)
let coneSegments = 64

// ---------------- Container Cone (static, cel-shaded) ----------------
const containerGeometry = new THREE.ConeGeometry(
  coneRadius,
  coneHeight,
  coneSegments
)
const containerMaterial = new THREE.MeshToonMaterial({
  color: 0x000000,
  gradientMap: gradientTexture,
  transparent: true,
  opacity: 0.1,
})
const containerCone = new THREE.Mesh(containerGeometry, containerMaterial)
containerCone.rotation.x = Math.PI
containerCone.position.y = coneHeight / 2
scene.add(containerCone)

// ---------------- Water Cone (animated, cel-shaded with video) ----------------
const waterGeometry = new THREE.ConeGeometry(
  coneRadius,
  coneHeight,
  coneSegments
)
const videoTexture = new THREE.VideoTexture(video)
const waterMaterial = new THREE.MeshToonMaterial({ map: videoTexture })
const waterCone = new THREE.Mesh(waterGeometry, waterMaterial)
waterCone.rotation.x = Math.PI
waterCone.position.z = 0.001 // tiny offset to prevent z-fighting

// Group water cone for scaling
const waterGroup = new THREE.Group()
waterGroup.add(waterCone)
scene.add(waterGroup)

// Initial scale & alignment
waterGroup.scale.set(0.01, 0.01, 0.01)
waterGroup.position.y = (coneHeight * waterGroup.scale.y) / 2

// ---------------- Orbit Controls ----------------
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0)
controls.enableDamping = true
controls.enableRotate = true
controls.enableZoom = true
controls.enablePan = true

// ---------------- Update Cones Function ----------------
function updateCones() {
  // Dispose old geometries
  containerCone.geometry.dispose()
  waterCone.geometry.dispose()

  // New geometries
  containerCone.geometry = new THREE.ConeGeometry(
    coneRadius,
    coneHeight,
    coneSegments
  )
  waterCone.geometry = new THREE.ConeGeometry(
    coneRadius,
    coneHeight,
    coneSegments
  )

  // Align positions
  containerCone.position.y = coneHeight / 2
  waterGroup.position.y = (coneHeight * waterGroup.scale.y) / 2
}

// ---------------- Input Listeners ----------------
document.getElementById('heightInput').addEventListener('input', (e) => {
  coneHeight = parseFloat(e.target.value)
  updateCones()
})

document.getElementById('radiusInput').addEventListener('input', (e) => {
  coneRadius = parseFloat(e.target.value)
  updateCones()
})

// ---------------- Animation ----------------
let scaleDirection = 1
const minScale = 0.01
const maxScale = 1.01
let currentScale = 0.01

function animate() {
  requestAnimationFrame(animate)

  // Animate scaling of waterGroup
  currentScale += scaleDirection * 0.001
  if (currentScale > maxScale || currentScale < minScale) scaleDirection *= -1
  waterGroup.scale.set(currentScale, currentScale, currentScale)

  // Keep base aligned
  waterGroup.position.y = (coneHeight * currentScale) / 2

  controls.update()
  renderer.render(scene, camera)
}

animate()

// ---------------- Handle Window Resize ----------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
