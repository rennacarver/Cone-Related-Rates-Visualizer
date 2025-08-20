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

// Load water texture and video
const textureLoader = new THREE.TextureLoader()
const waterTexture = textureLoader.load('water2.jpg')

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

// Create container (red) cone
const containerGeometry = new THREE.ConeGeometry(
  coneRadius,
  coneHeight,
  coneSegments
)
const containerMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.1,
})
const containerCone = new THREE.Mesh(containerGeometry, containerMaterial)
containerCone.rotation.x = Math.PI
containerCone.position.y = coneHeight / 2
scene.add(containerCone)

// Create water (blue) cone
const waterGeometry = new THREE.ConeGeometry(
  coneRadius,
  coneHeight,
  coneSegments
)
const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // placeholder
const waterCone = new THREE.Mesh(waterGeometry, waterMaterial)
waterCone.rotation.x = Math.PI
scene.add(waterCone)

// tiny offset toward the camera (prevents z-fighting)
waterCone.position.z = 0.001

// Apply video texture to water cone
const videoTexture = new THREE.VideoTexture(video)
waterCone.material = new THREE.MeshBasicMaterial({ map: videoTexture })
waterCone.scale.set(0.01, 0.01, 0.01)
waterCone.position.y = (coneHeight * waterCone.scale.y) / 2

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0)
controls.enableDamping = true
controls.enableRotate = true
controls.enableZoom = true
controls.enablePan = true

// Function to update cone geometries and positions
function updateCones() {
  // Dispose old geometries
  containerCone.geometry.dispose()
  waterCone.geometry.dispose()

  // Create new geometries
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

  // Align bases
  containerCone.position.y = coneHeight / 2
  waterCone.position.y = (coneHeight * waterCone.scale.y) / 2
}

// Input event listeners
document.getElementById('heightInput').addEventListener('input', (e) => {
  coneHeight = parseFloat(e.target.value)
  updateCones()
})

document.getElementById('radiusInput').addEventListener('input', (e) => {
  coneRadius = parseFloat(e.target.value)
  updateCones()
})

// Animation
let scaleDirection = 1
const minScale = 0.01
const maxScale = 1.01
let currentScale = 0.01

function animate() {
  requestAnimationFrame(animate)

  // Animate water cone scaling
  currentScale += scaleDirection * 0.001
  if (currentScale > maxScale || currentScale < minScale) scaleDirection *= -1
  waterCone.scale.set(currentScale, currentScale, currentScale)

  // Adjust position to keep base aligned
  waterCone.position.y = (coneHeight * currentScale) / 2

  renderer.render(scene, camera)
}

animate()

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
