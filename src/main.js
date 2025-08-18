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

// Create cone
const coneGeometry = new THREE.ConeGeometry(1, 2, 32)
const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const cone = new THREE.Mesh(coneGeometry, coneMaterial)
cone.rotation.x = Math.PI
scene.add(cone)

// Create orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0) // Look at the origin

// Control settings
// controls.enableDamping = true
// controls.enableRotate = true

function animate() {
  requestAnimationFrame(animate)
  cone.rotation.y += 0.01
  controls.update()
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)
