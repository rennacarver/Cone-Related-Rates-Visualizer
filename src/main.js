import * as THREE from 'three'
import Desmos from 'desmos'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

//Desmos setup
const elt = document.getElementById('desmos-graph')
elt.style.width = window.innerWidth
elt.style.height = '400px'

const calculator = Desmos.GraphingCalculator(elt, {
  keypad: false,
  expressions: false,
  settingsMenu: false,
  zoomButtons: false,
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
resizeDesmos()

// Scene setup
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xf4f4f4)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 5
camera.position.y = 3

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('threejs-canvas'),
  antialias: true,
})

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Set three.js Canvas size
setCanvasSize()

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
let thresholdAngle = 30

// Rates values
let prevRadius, prevHeight, prevVolume, currHeight, currVolume, currRadius
let radiusRate, heightRate, volumeRate

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

// Center camera on cone
centerCameraOnCone()

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
  calculator.setMathBounds({
    left: -0.2 * maxScale,
    right: maxScale * 1.2,
    bottom: -0.2 * calculateYMax(),
    top: calculateYMax() * 1.1,
  })
}

// ---------------- Keep camera centered----------------
function centerCameraOnCone() {
  const box = new THREE.Box3().setFromObject(containerGroup)
  const center = new THREE.Vector3()
  box.getCenter(center)

  controls.target.copy(center) // OrbitControls will orbit around cone center
  camera.lookAt(center)
}

// ---------------- Set Canvas Size ----------------
function setCanvasSize() {
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9

  // Update camera aspect to 1 (since it's square)
  camera.aspect = 1
  camera.updateProjectionMatrix()

  // Force renderer canvas to square
  renderer.setSize(size, size)
}

// ---------------- Set Desmos Size ----------------
function resizeDesmos() {
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9

  const desmosElt = document.getElementById('desmos-graph')
  desmosElt.style.width = `${size}px`
  desmosElt.style.height = `${size}px` // height = width → square
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

// ---------------- Update Value Bars ----------------
function updateValueBars() {
  volumeBar.style.width = `${
    barLength * (calculateVolume() / calculateBarsMax())
  }px`
  radiusBar.style.width = `${
    barLength * (calculateRadius() / calculateBarsMax())
  }px`
  heightBar.style.width = `${
    barLength * (calculateHeight() / calculateBarsMax())
  }px`
}

// ---------------- Update Rate Value Bars ----------------
function updateRateValueBars() {
  volumeRateBar.style.width = `${Math.min(Math.abs(volumeRate * 1000), 200)}px`
  radiusRateBar.style.width = `${Math.min(Math.abs(radiusRate * 1000), 200)}px`
  heightRateBar.style.width = `${Math.min(Math.abs(heightRate * 1000), 200)}px`
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

// ---------------- Calculate Desmos Window Zoom ----------------
function calculateYMax() {
  return Math.max(calculateVolume(), calculateRadius(), calculateHeight())
}

// ---------------- Calculate Value Bars Range ----------------
function calculateBarsMax() {
  return Math.max(
    coneHeight,
    coneRadius,
    (1 / 3) * Math.PI * coneHeight * coneRadius * coneRadius
  )
}

// ---------------- Value Bars ----------------
const volumeBar = document.getElementById('volume-bar')
const radiusBar = document.getElementById('radius-bar')
const heightBar = document.getElementById('height-bar')
const barLength = 200

// ---------------- Rate Value Bars ----------------
const volumeRateBar = document.getElementById('volume-rate-bar')
const radiusRateBar = document.getElementById('radius-rate-bar')
const heightRateBar = document.getElementById('height-rate-bar')

// ---------------- Calculate Rates ----------------
function calculateRates() {
  volumeRate = currVolume - prevVolume
  heightRate = currHeight - prevHeight
  radiusRate = currRadius - prevRadius
}

// ---------------- Dimension Display --------------
const volumeDisplay = document.getElementById('volume-display')
const radiusDisplay = document.getElementById('radius-display')
const heightDisplay = document.getElementById('height-display')

function updateDisplays() {
  volumeDisplay.textContent = calculateVolume().toFixed(2)
  radiusDisplay.textContent = calculateRadius().toFixed(2)
  heightDisplay.textContent = calculateHeight().toFixed(2)
}

// ---------------- Rates Display --------------
const volumeRateDisplay = document.getElementById('volume-rate-display')
const radiusRateDisplay = document.getElementById('radius-rate-display')
const heightRateDisplay = document.getElementById('height-rate-display')

function updateRateDisplays() {
  volumeRateDisplay.textContent = (volumeRate * 1000).toFixed(2)
  radiusRateDisplay.textContent = (radiusRate * 1000).toFixed(2)
  heightRateDisplay.textContent = (heightRate * 1000).toFixed(2)
}

// ---------------- Input Listeners ----------------
document.getElementById('heightInput').addEventListener('input', (e) => {
  coneHeight = parseFloat(e.target.value)
  updateCones()
  updateDisplays()
  updateRateDisplays()
  updateDesmos()
  centerCameraOnCone()
})

document.getElementById('radiusInput').addEventListener('input', (e) => {
  coneRadius = parseFloat(e.target.value)
  updateCones()
  updateDisplays()
  updateRateDisplays()
  updateDesmos()
  centerCameraOnCone()
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

// ---------------- Handle Window Resize ----------------
window.addEventListener('resize', () => {
  setCanvasSize()
  resizeDesmos()
})

// ---------------- Animation ----------------
let isPlaying = true
let scaleDirection = 1
const minScale = 0.01
const maxScale = 1.0
let currentScale = 0.01
let currentFrame = 0

function animate() {
  requestAnimationFrame(animate)

  if (isPlaying) {
    // Animate scaling of waterGroup (cone + edges)
    currentScale += scaleDirection * 0.001
    currHeight = calculateHeight()
    currRadius = calculateRadius()
    currVolume = calculateVolume()
    animationSlider.value = currentScale * 1000
    if (currentScale > maxScale || currentScale < minScale) scaleDirection *= -1
    waterGroup.scale.set(currentScale, currentScale, currentScale)

    // Keep base aligned
    waterGroup.position.y = (coneHeight * currentScale) / 2

    calculateRates()
    updateValueBars()
    updateRateValueBars()
    updateDisplays()
    updateRateDisplays()
    updateDesmos()

    prevHeight = currHeight
    prevRadius = currRadius
    prevVolume = currVolume
  }

  if (!isPlaying) {
    // Update current frame based on slider value
    currentFrame = animationSlider.value / 1000
    currentScale = currentFrame
    currHeight = calculateHeight()
    currRadius = calculateRadius()
    currVolume = calculateVolume()

    // Animate scaling of waterGroup (cone + edges)
    waterGroup.scale.set(currentFrame, currentFrame, currentFrame)

    // Keep base aligned
    waterGroup.position.y = (coneHeight * waterGroup.scale.y) / 2

    calculateRates()
    updateValueBars()
    updateRateValueBars()
    updateDisplays()
    updateRateDisplays()
    updateDesmos()

    prevHeight = currHeight
    prevRadius = currRadius
    prevVolume = currVolume
  }

  controls.update()
  renderer.render(scene, camera)
}

animate()
