import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(44); // Start camera a bit further back
camera.position.setX(0); // Center camera

renderer.render(scene, camera);

// Load the phone model
const loader = new GLTFLoader();
let phone;
let videoTexture;

// Add video texture to the phone screen
const video = document.getElementById('video');
videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

loader.load('/scene.gltf', function (gltf) {
  phone = gltf.scene;
  scene.add(phone);
  phone.position.set(0, 0, 25); // Move phone closer to the camera
  phone.rotation.x = -0.1; // Tilt phone back by 10 degrees

  video.addEventListener('canplaythrough', () => {
    phone.traverse((child) => {
      if (child.isMesh && child.name === 'phoneScreen') {
        let material = new THREE.MeshBasicMaterial({ map: videoTexture });

        // Don't change this
        // Adjust texture scaling and offset
        material.map.repeat.set(1.10, 1.00);
        material.map.offset.set(0.0, 0.008); // Center the scaled texture

        child.material = material;

        material.map.rotation = -Math.PI / 2; // Rotate the texture to fit the vertical screen
        material.map.center.set(0.5, 0.5); // Set rotation center
      }
    });
  });

}, undefined, function (error) {
  console.error(error);
});

// Create the pedestal object
const pedestalGeometry = new THREE.CylinderGeometry(2, 2, 1, 64); // Adjusted pedestal dimensions
const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x080808 });
const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
pedestal.position.set(0, -80, 20);
pedestal.visible = false; // Initially hidden
scene.add(pedestal);

// Load coin model and add to scene
const coinLoader = new GLTFLoader();
let coins = [];
coinLoader.load('/coin.gltf', function (gltf) {
  for (let i = 0; i < 10; i++) {
    let coin = gltf.scene.clone();
    coin.position.set(Math.random() * 20 - 10, Math.random() * 20 + 10, Math.random() * 10 - 5);
    scene.add(coin);
    coins.push(coin);
  }
}, undefined, function (error) {
  console.error(error);
});

// Animate coins falling
function animateCoins() {
  const activeCoins = coins.slice(0, 3); // Use only 3 coins at a time
  activeCoins.forEach((coin) => {
    const rotationDirection = Math.random() > 0.5 ? 1 : -1; // Randomly rotate in different directions
    coin.position.x = Math.random() * 20 - 10; // Randomize x position
    gsap.to(coin.position, {
      y: -20,
      duration: 4,
      ease: "none",
      onComplete: () => {
        coin.position.y = Math.random() * 20 + 10; // Reset position
        if (currentPhase === 4) {
          animateCoins(); // Ensure continuous animation in phase 5
        }
      }
    });
    gsap.to(coin.rotation, {
      y: rotationDirection * Math.PI * 2,
      duration: 4,
      ease: "none",
      repeat: -1
    });
  });
}

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(50, 50, 50000);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Background
const backgroundColor = new THREE.Color(0x010912);
scene.background = backgroundColor;

// Scroll Animation
let currentPhase = 0;
let isAnimating = false;
let timerSet = false;

function moveCamera(direction) {
  // Ensure phone is defined before accessing its properties
  if (phone && !isAnimating) {
    if (direction === 'down' && currentPhase < 4) {
      currentPhase++;
    } else if (direction === 'up' && currentPhase > 0) {
      currentPhase--;
    }

    // Phase 1: Initial movement
    if (currentPhase === 0) {
      isAnimating = true;
      gsap.to(camera.position, {
        z: 29, y: 0, duration: 1, onComplete: () => {
          isAnimating = false;
        }
      });
      gsap.to(phone.position, { z: 10, y: 0, duration: 1 });
      gsap.to(phone.rotation, { y: 0, duration: 1 });
    }

    // Phase 2
    if (currentPhase === 1) {
      isAnimating = true;
      gsap.to(camera.position, {
        z: 23, y: -6, duration: 1, onComplete: () => {
          isAnimating = false;
        }
      });
      gsap.to(phone.rotation, { y: Math.PI / 1 * 2, duration: 1 });
      gsap.to(phone.position, { z: 19, y: -6, duration: 1 });
      gsap.to(pedestal.position, { y: -40, duration: 1 });

      pedestal.visible = true;
    }

    // Phase 3
    if (currentPhase === 2) {
      isAnimating = true;
      gsap.to(camera.position, {
        z: 20, y: -7, duration: 1, onComplete: () => {
          isAnimating = false;
        }
      });
      gsap.to(phone.position, { z: 15, y: -8, duration: 1 });
      gsap.to(pedestal.position, { z: 14, y: -9.8, duration: 1 });
      gsap.to(phone.rotation, { y: Math.PI / 6, duration: 1 });
    }

    // Phase 4
    if (currentPhase === 3) {
      isAnimating = true;
      gsap.to(camera.position, {
        z: 14, y: -7, duration: 1, onComplete: () => {
          isAnimating = false;
        }
      });
      gsap.to(phone.position, { z: 5, y: -8, duration: 1 });
      gsap.to(pedestal.position, { z: 5, y: -10, duration: 1 });
      gsap.to(phone.rotation, { y: Math.PI / -6, duration: 1 });
    }

    // Phase 5: Final positioning and play video
    if (currentPhase === 4) {
      isAnimating = true;
      gsap.to(camera.position, {
        z: 10, y: -12, x: 0.036, duration: 1, onComplete: () => {
          isAnimating = false;
          if (video.paused) {
            video.play();
          }
          animateCoins(); // Start coin animation in phase 5
        }
      });
      gsap.to(phone.position, { z: 7.5, y: -12.7, duration: 1 });
      gsap.to(pedestal.position, { z: 6.5, y: -14.5, duration: 1 });
      gsap.to(phone.rotation, { y: 0, duration: 1 });
      phone.rotation.x = -0.03;

      if (!timerSet) {
        timerSet = true;
        timer = setTimeout(() => {
          video.pause();
          video.currentTime = 1; // Set video to the 1-second mark
          const button = document.getElementById('button');
          button.style.display = 'block'; // Show button
          gsap.to(button, { opacity: 1, y: 0, duration: 0.3 }); // Fade in button with upward motion
          button.classList.add('pulsate');
        }, 27000); // 27 seconds
      }
    } else {
      timerSet = false;
    }

    // Show button if in phase 5, otherwise hide
    const button = document.getElementById('button');
    if (currentPhase === 4) {
      clearTimeout(timer); // Clear any existing timer
      timer = setTimeout(() => {
        button.style.display = 'block';
        gsap.fromTo(button, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 });
      }, 27000); // 27 seconds
    } else {
      clearTimeout(timer); // Clear any existing timer
      gsap.to(button, { opacity: 0, y: 20, duration: 0.3, onComplete: () => {
        button.style.display = 'none';
      }});
    }

    // Pause video if not in phase 5
    if (currentPhase !== 4 && !video.paused) {
      video.pause();
      video.currentTime = 0; // Reset video to start
      document.getElementById('video').style.display = 'none';
    } else if (currentPhase === 4) {
      document.getElementById('video').style.display = 'block';
    }

    camera.updateProjectionMatrix();
  }
}

window.addEventListener('wheel', (event) => {
  if (event.deltaY > 0) {
    moveCamera('down');
  } else {
    moveCamera('up');
  }
});

// Add touch event listeners for mobile devices
let touchStartY = 0;
let touchEndY = 0;

window.addEventListener('touchstart', (event) => {
  touchStartY = event.changedTouches[0].screenY;
}, false);

window.addEventListener('touchmove', (event) => {
  touchEndY = event.changedTouches[0].screenY;
}, false);

window.addEventListener('touchend', () => {
  if (touchEndY < touchStartY) {
    moveCamera('down');
  } else if (touchEndY > touchStartY) {
    moveCamera('up');
  }
}, false);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

// Timer to stop video after 27 seconds and show button
let timer = null;

video.addEventListener('play', () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    video.pause();
    video.currentTime = 1; // Set video to the 1-second mark
    const button = document.getElementById('button');
    button.style.display = 'block'; // Show button
    gsap.to(button, { opacity: 1, y: 0, duration: 0.3 }); // Fade in button with upward motion
    button.classList.add('pulsate');
  }, 27000); // 27 seconds
});

video.addEventListener('timeupdate', () => {
  if (video.currentTime >= video.duration - 0.1) {
    video.pause();
    video.currentTime = 1; // Set video to the 1-second mark
    const button = document.getElementById('button');
    button.style.display = 'block'; // Show button
    gsap.to(button, { opacity: 1, y: 0, duration: 0.3 }); // Fade in button with upward motion
    button.classList.add('pulsate'); // Add pulsate animation
  }
});
