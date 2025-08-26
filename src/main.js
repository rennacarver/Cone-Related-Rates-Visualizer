import * as THREE from 'three'
import Desmos from 'desmos'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

//Desmos setup
const elt = document.createElement('div')
elt.style.width = `${window.innerWidth}`
elt.style.height = '400px'

const calculator = Desmos.GraphingCalculator(elt, {
  keypad: false,
  expressionsCollapsed: false,
  settingsMenu: false,
})
calculator.setExpression({
  id: 'Volume',
  latex: '(t, \\frac{1}{3}\\pi (t\\cdot r)^2(t \\cdot h))',
  parametricDomain: { min: '0', max: 'a' },
  color: Desmos.Colors.PURPLE,
  label: 'Volume',
})
calculator.setExpression({
  id: 'Radius',
  latex: '(t, t\\cdot r)',
  parametricDomain: { min: '0', max: 'a' },
  color: Desmos.Colors.BLUE,
  label: 'Radius',
})
calculator.setExpression({
  id: 'Height',
  latex: '(t, t\\cdot h)',
  parametricDomain: { min: '0', max: 'a' },
  color: Desmos.Colors.RED,
  label: 'Height',
})

document.body.append(elt)

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
camera.position.y = 3

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

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
let coneSegments = 32
let thresholdAngle = 30

// ---------------- Container Cone (static) ----------------
const containerGeometry = new THREE.ConeGeometry(
  coneRadius,
  coneHeight,
  coneSegments
)
const containerMaterial = new THREE.MeshBasicMaterial({
  color: 0x87ceeb,
  transparent: true,
  opacity: 0.1,
})
const containerCone = new THREE.Mesh(containerGeometry, containerMaterial)
containerCone.rotation.x = Math.PI

// Black silhouette edges for container cone
const containerEdgeGeometry = new THREE.EdgesGeometry(
  containerGeometry,
  thresholdAngle
)
const containerEdgeLines = new THREE.LineSegments(
  containerEdgeGeometry,
  new THREE.LineBasicMaterial({ color: 0x000000 })
)
containerEdgeLines.rotation.x = Math.PI

// Group container cone + edges
const containerGroup = new THREE.Group()
containerGroup.add(containerCone)
containerGroup.add(containerEdgeLines)
containerGroup.position.y = coneHeight / 2
scene.add(containerGroup)

// ---------------- Water Cone (animated) ----------------
const waterGeometry = new THREE.ConeGeometry(
  coneRadius,
  coneHeight,
  coneSegments
)
const videoTexture = new THREE.VideoTexture(video)
const waterMaterial = new THREE.MeshBasicMaterial({ map: videoTexture })
//const waterMaterial = new THREE.MeshToonMaterial({ color: 0x87ceeb }) // Sky blue
const waterCone = new THREE.Mesh(waterGeometry, waterMaterial)
waterCone.rotation.x = Math.PI
waterCone.position.z = 0.001 // tiny offset to prevent z-fighting

// White silhouette edges for water cone
const edgeGeometry = new THREE.EdgesGeometry(waterGeometry, thresholdAngle)
const edgeLines = new THREE.LineSegments(
  edgeGeometry,
  new THREE.LineBasicMaterial({ color: 0xffffff })
)
edgeLines.rotation.x = Math.PI

// Group water cone + edges for scaling
const waterGroup = new THREE.Group()
waterGroup.add(waterCone)
waterGroup.add(edgeLines)
scene.add(waterGroup)

// Initial scale & alignment
waterGroup.scale.set(0.01, 0.01, 0.01)
waterGroup.position.y = (coneHeight * waterGroup.scale.y) / 2

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1) // soft white light
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 1, 10) // white light
pointLight.position.set(2, 2, 2)
scene.add(pointLight)

// Add a directional light for more dramatic effect
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(-2, 2, 2)
scene.add(directionalLight)

// ---------------- Orbit Controls ----------------
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0)
controls.enableDamping = true
controls.enableRotate = true
controls.enableZoom = true
controls.enablePan = true

// ---------------- Update Desmos Function ----------------
function updateDesmos() {
  calculator.removeExpression({ id: 'a' })
  calculator.removeExpression({ id: 'r' })
  calculator.removeExpression({ id: 'h' })
  calculator.setExpression({
    id: 'a',
    latex: `a=${currentScale.toFixed(2)}`,
  })
  calculator.setExpression({
    id: 'r',
    latex: `r=${(currentScale * coneRadius).toFixed(2)}`,
    hidden: true,
  })
  calculator.setExpression({
    id: 'h',
    latex: `h=${(currentScale * coneHeight).toFixed(2)}`,
  })
}

// ---------------- Update Cones Function ----------------
function updateCones() {
  // Dispose old geometries
  containerCone.geometry.dispose()
  containerEdgeLines.geometry.dispose()
  waterCone.geometry.dispose()
  edgeLines.geometry.dispose()

  // New geometries
  containerCone.geometry = new THREE.ConeGeometry(
    coneRadius,
    coneHeight,
    coneSegments
  )
  containerEdgeLines.geometry = new THREE.EdgesGeometry(
    containerCone.geometry,
    45
  )
  containerEdgeLines.rotation.x = Math.PI

  waterCone.geometry = new THREE.ConeGeometry(
    coneRadius,
    coneHeight,
    coneSegments
  )
  edgeLines.geometry = new THREE.EdgesGeometry(waterCone.geometry, 45)
  edgeLines.rotation.x = Math.PI

  // Align positions
  containerGroup.position.y = coneHeight / 2
  waterGroup.position.y = (coneHeight * waterGroup.scale.y) / 2
}

// ---------------- Math Formulas --------------
function calculateVolume() {
  return (
    (1 / 3) *
    Math.PI *
    coneRadius *
    coneRadius *
    coneHeight *
    currentScale *
    currentScale *
    currentScale
  )
}

function calculateRadius() {
  return coneRadius * currentScale
}

function calculateHeight() {
  return coneHeight * currentScale
}

// ---------------- Dimension Display --------------
const volumeDisplay = document.getElementById('volume-display')
const radiusDisplay = document.getElementById('radius-display')
const heightDisplay = document.getElementById('height-display')

function updateDisplays() {
  const volume = calculateVolume()
  volumeDisplay.textContent = volume.toFixed(2)

  radiusDisplay.textContent = calculateRadius().toFixed(2)
  heightDisplay.textContent = calculateHeight().toFixed(2)
}

// ---------------- Input Listeners ----------------
document.getElementById('heightInput').addEventListener('input', (e) => {
  coneHeight = parseFloat(e.target.value)
  updateCones()
  updateDisplays()
})

document.getElementById('radiusInput').addEventListener('input', (e) => {
  coneRadius = parseFloat(e.target.value)
  updateCones()
  updateDisplays()
})

const playPauseButton = document.getElementById('play-pause-button')
playPauseButton.addEventListener('click', () => {
  isPlaying = !isPlaying
  playPauseButton.textContent = isPlaying ? 'Pause' : 'Play'
})

const animationSlider = document.getElementById('animation-slider')

animationSlider.addEventListener('click', () => {
  isPlaying = false
  playPauseButton.textContent = isPlaying ? 'Pause' : 'Play'
  updateDesmos()
})

// ---------------- Animation ----------------
let isPlaying = true
let scaleDirection = 1
const minScale = 0.01
const maxScale = 1.01
let currentScale = 0.01
let currentFrame = 0

function animate() {
  requestAnimationFrame(animate)

  if (isPlaying) {
    // Animate scaling of waterGroup (cone + edges)
    currentScale += scaleDirection * 0.001
    animationSlider.value = currentScale * 1000
    if (currentScale > maxScale || currentScale < minScale) scaleDirection *= -1
    waterGroup.scale.set(currentScale, currentScale, currentScale)

    // Keep base aligned
    waterGroup.position.y = (coneHeight * currentScale) / 2

    //update Display
    updateDisplays()
  }

  if (!isPlaying) {
    // Update current frame based on slider value
    currentFrame = animationSlider.value / 1000
    currentScale = currentFrame

    // Animate scaling of waterGroup (cone + edges)
    waterGroup.scale.set(currentFrame, currentFrame, currentFrame)

    // Keep base aligned
    waterGroup.position.y = (coneHeight * waterGroup.scale.y) / 2

    //update Display
    updateDisplays()
  }

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
