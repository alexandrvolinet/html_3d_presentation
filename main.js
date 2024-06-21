import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(40); // Start camera a bit further back
camera.position.setX(0); // Center camera

renderer.render(scene, camera);

// Load the phone model
const loader = new GLTFLoader();
let phone;

loader.load('/scene.gltf', function (gltf) {
  phone = gltf.scene;
  scene.add(phone);
  phone.position.set(0, 0, 25);

  // Add video texture to the phone screen
  let video = document.getElementById('video');
  let videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;

  video.addEventListener('canplaythrough', () => {
    phone.traverse((child) => {
      if (child.isMesh && child.name === 'phoneScreen') {
        // Correct texture orientation and scaling
        let material = new THREE.MeshBasicMaterial({ map: videoTexture });

        // Adjust texture scaling and offset
        material.map.repeat.set(1.05, 1.05); // Scale down the texture to 95%
        material.map.offset.set(-0.025, 0.005); // Center the scaled texture

        child.material = material;

        // Rotate the texture if necessary
        material.map.rotation = -Math.PI / 2; // Rotate the texture to fit the vertical screen
        material.map.center.set(0.5, 0.5); // Set rotation center
      }
    });
  });

}, undefined, function (error) {
  console.error(error);
});

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Scroll Animation
function moveCamera() {
  const t = window.scrollY;
  const scrollMax = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = Math.min(Math.max(t / scrollMax, 0), 1);

  // Control camera position and rotation based on scroll percent
  camera.position.z = 40 - scrollPercent * 17; // Adjust camera position
  camera.position.y = scrollPercent * -4; // Slightly move camera up as scroll progresses
  camera.position.x = 0; // Keep camera centered
  camera.rotation.y = 0; // No rotation
  camera.updateProjectionMatrix();

  // Control phone position and rotation based on scroll percent
  if (phone) {
    phone.position.z = 25 - scrollPercent * 5; // Move from z=25 to z=20
    phone.position.y = -scrollPercent * 5; // Move phone down as scroll progresses
    phone.rotation.y = scrollPercent * Math.PI * 2; // Rotate from 0 to 360 degrees

    // Center phone and stop rotation when scroll percent reaches 1
    if (scrollPercent === 1) {
      phone.rotation.y = 0;
      phone.position.set(0, -5, 20); // Adjust final position of phone
    }
  }

  // Play video when scroll percent reaches 1
  if (scrollPercent === 1) {
    document.getElementById('video').style.display = 'block';
  } else {
    document.getElementById('video').style.display = 'none';
  }
}

window.addEventListener('scroll', moveCamera);
moveCamera();

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
