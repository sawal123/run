// state.js
import * as THREE from 'three';

export const state = {
  clock: new THREE.Clock(),
  gameStarted: false,
  gameEnded: false,
  timeLeft: 20,
  countdown: 3,
  finishZ: -120,
  speed: 0.15,
  player1: null,
  player2: null,
  mixer1: null,
  mixer2: null,
  shouldAnimateP1: false,
  shouldAnimateP2: false,
};