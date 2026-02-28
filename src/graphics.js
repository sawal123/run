// graphics.js
import * as THREE from "three";
import { state } from "./state.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 30, 150);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setScissorTest(true);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

export const camera1 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
export const camera2 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

export function setupLighting() {
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const light = new THREE.DirectionalLight(0xffffee, 1.5);
  light.position.set(20, 60, 40);
  light.castShadow = true;
  light.shadow.camera.left = -50;
  light.shadow.camera.right = 50;
  light.shadow.camera.top = 150;
  light.shadow.camera.bottom = -150;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.bias = -0.001;
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const sunGeometry = new THREE.SphereGeometry(15, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffee });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(0, 60, state.finishZ - 30);
  scene.add(sun);
}
