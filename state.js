// src/state.js

let tieredEnabled = true;

export function setTieredEnabled(value) {
  tieredEnabled = value;
}

export function isTieredEnabled() {
  return tieredEnabled;
}
