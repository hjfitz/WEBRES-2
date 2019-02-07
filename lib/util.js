export function simulateKey(event, keyCode) {
  const ev = new KeyboardEvent(event, { keyCode, cancelable: true });
  document.dispatchEvent(ev);
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}
