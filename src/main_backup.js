import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const geometry = new THREE.ConeGeometry(1, 2, 32)
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff, // Green color
  transparent: true, // Enable transparency
  opacity: 0.5, // 50% opacity (0 = fully transparent, 1 = fully opaque)
})
const cone = new THREE.Mesh(geometry, material)
scene.add(cone)

// Create a smaller smaller cone inside
const smallGeometry = new THREE.ConeGeometry(1, 2, 32)
const smallMaterial = new THREE.MeshBasicMaterial({ color: 0x40e0d0 }) // turquoise
const smallCone = new THREE.Mesh(smallGeometry, smallMaterial)
scene.add(smallCone)

// Flip the larger cone vertically
cone.rotation.x = Math.PI // 180 degrees around x-axis
smallCone.rotation.x = Math.PI // 180 degrees around x-axis

camera.position.z = 5

// Variables to store rotation
let isDragging = false
let previousMousePosition = {
  x: 0,
  y: 0,
}

// Add event listeners
document.addEventListener('mousedown', onDocumentMouseDown)
document.addEventListener('mousemove', onDocumentMouseMove)
document.addEventListener('mouseup', onDocumentMouseUp)

// Event handler for mouse click down
function onDocumentMouseDown(event) {
  event.preventDefault()
  isDragging = true
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  }
}

// Event handler for mouse move
function onDocumentMouseMove(event) {
  if (isDragging) {
    const deltaMousePosition = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    }

    // Update rotation
    cone.rotation.z += deltaMousePosition.y * 0.01
    cone.rotation.y += deltaMousePosition.x * 0.01
    smallCone.rotation.z += deltaMousePosition.y * 0.01
    smallCone.rotation.y += deltaMousePosition.x * 0.01

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    }
  }
}

// Event handler for mouse up
function onDocumentMouseUp() {
  isDragging = false
}

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
  smallCone.scale.set(currentScale, currentScale, currentScale)
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)
