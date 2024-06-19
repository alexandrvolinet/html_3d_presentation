import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// Scene

const loader = new GLTFLoader();

loader.load('scene.gltf', function (gltf) {
  const model = gltf.scene;
  scene.add(model);
  
  model.position.set(0, 0, 0);
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

  scene.rotation.y += 0.00001;

  renderer.render(scene, camera);
}

animate();