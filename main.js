import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

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
  video.play();
  let videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;

  // Ensure the video is loaded before applying the texture
  video.addEventListener('canplaythrough', () => {
    phone.traverse((child) => {
      if (child.isMesh && child.name === 'Object_9') { // Используем имя 'Object_9'
        child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
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
  const t = document.body.getBoundingClientRect().top;
  camera.position.z = 30 + t * -0.01;
  camera.position.x = -3 + t * -0.002;
  camera.rotation.y = t * 0.000005;
  camera.fov = 75 - t * -0.0001;
  camera.updateProjectionMatrix();
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  if (phone) {
    phone.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}

animate();