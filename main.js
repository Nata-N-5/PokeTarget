import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// Escena
const scene = new THREE.Scene();

// Cámara y grupo de cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);
cameraGroup.position.set(0, 10, 30);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local');
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Controles
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1.6, 0);
controls.target.set(0, 1.6, 0);
controls.update();

// Luces
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Texturas aleatorias
const textures = ['target1.png', 'target2.png', 'target3.png'];
const loader = new THREE.TextureLoader();

function getRandomTexture() {
  const index = Math.floor(Math.random() * textures.length);
  return loader.load(textures[index]);
}

function createTargetSprite() {
  const texture = getRandomTexture();
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1.5, 1.5, 1.5);
  return sprite;
}

const target = createTargetSprite();
scene.add(target);

function moveTargetRandomly() {
  const range = 10;
  const x = (Math.random() - 0.5) * 2 * range;
  const y = Math.random() * 4 + 1;
  const z = (Math.random() - 0.5) * 2 * range;
  target.position.set(x, y, z);
  target.material.map = getRandomTexture();
  target.material.needsUpdate = true;
}

moveTargetRandomly();

// Skybox
const textureCube = new THREE.CubeTextureLoader().setPath('/').load([
  'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'
]);
scene.background = textureCube;

// Detección de clics
window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(target);
  if (intersects.length > 0) {
    console.log("¡Capturaste el Pokémon!");
    moveTargetRandomly();
  }
});

// Pistola
const gunGeometry = new THREE.PlaneGeometry(0.4, 0.4);
const gunTexture = loader.load('/gun.png');
const gunMaterial = new THREE.MeshStandardMaterial({
  map: gunTexture,
  transparent: true,
  side: THREE.DoubleSide,
});
const gun = new THREE.Mesh(gunGeometry, gunMaterial);
gun.position.set(0.3, -0.3, -1);
gun.rotation.y = Math.PI; 

const cameraHolder = new THREE.Group();
cameraHolder.add(camera);  // cámara dentro del grupo
scene.add(cameraHolder);   // grupo dentro de la escena

camera.add(gun);         

// Controladores de VR
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1);
scene.add(controller2);

// Animación
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

// Redimensionamiento
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
