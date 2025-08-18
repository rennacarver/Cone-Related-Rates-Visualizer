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

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

camera.position.z = 5

// Create red cone
const redConeGeometry = new THREE.ConeGeometry(1, 2, 32)
const redConeMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.5,
})
const redCone = new THREE.Mesh(redConeGeometry, redConeMaterial)
redCone.rotation.x = Math.PI
scene.add(redCone)

// Create blue cone
let blueConeScale = 0.5
const blueConeGeometry = new THREE.ConeGeometry(1, 2, 32)
const blueConeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff })
const blueCone = new THREE.Mesh(blueConeGeometry, blueConeMaterial)
blueCone.rotation.x = Math.PI
blueCone.scale.set(blueConeScale, blueConeScale, blueConeScale)
scene.add(blueCone)

// Create orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0) // Look at the origin

// Control settings
controls.enableDamping = true
controls.enableRotate = true
controls.enableZoom = true
controls.enablePan = true

// Animation variables
let scaleDirection = 1
const minScale = 0.01
const maxScale = 1
let currentScale = 0.5

function animate() {
  // Animate small cone scale
  currentScale += scaleDirection * 0.001
  if (currentScale > maxScale || currentScale < minScale) {
    scaleDirection *= -1 // Change direction
  }
  blueCone.scale.set(currentScale, currentScale, currentScale)
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)
