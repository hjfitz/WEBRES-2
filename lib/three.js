const THREE = require('./three/three.module');

// must set to window to require loaders properly (for minification)
window.THREE = THREE;

module.exports = THREE;
