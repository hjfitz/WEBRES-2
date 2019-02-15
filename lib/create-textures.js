const THREE = require('./three');
require('./three/OBJLoader');

const objLoader = new THREE.OBJLoader();

const loadObj = url => new Promise(res => objLoader.load(url, res));


export async function createTrees() {
  const trees = [];
  const scene = [];

  const positions = [
    new THREE.Vector3(-250, 0, -166),
    new THREE.Vector3(-292, 0, 6),
    new THREE.Vector3(292, 0, 188),
    new THREE.Vector3(-249, 0, -19),
    new THREE.Vector3(198, 0, 188),
    new THREE.Vector3(72, 0, -47),
    new THREE.Vector3(-109, 0, 208),
    new THREE.Vector3(264, 0, 43),
    new THREE.Vector3(32, 0, 65),
    new THREE.Vector3(-297, 0, 109),
    new THREE.Vector3(14, 0, -297),
    new THREE.Vector3(287, 0, 139),
    new THREE.Vector3(269, 0, -205),
    new THREE.Vector3(-297, 0, -61),
    new THREE.Vector3(257, 0, -55),
    new THREE.Vector3(-287, 0, -20),
    new THREE.Vector3(183, 0, 65),
    new THREE.Vector3(-171, 0, 114),
    new THREE.Vector3(251, 0, 196),
    new THREE.Vector3(126, 0, -21),
    new THREE.Vector3(-169, 0, 269),
    new THREE.Vector3(-291, 0, -7),
  ];

  const tree = await loadObj('/three/models/low/tree.obj');
  positions.forEach((position) => {
    const treeObj = tree.clone();
    treeObj.children[0].material = new THREE.MeshPhongMaterial({ color: '#004c00' });
    const treeBox = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10, 5), new THREE.MeshBasicMaterial({ color: 'green' }));
    treeBox.add(treeObj);
    treeBox.material.visible = false;
    treeBox.material.side = THREE.DoubleSide;
    treeBox.position.set(position.x, 0, position.z);
    scene.push(treeBox);
    trees.push(treeBox);
  });
  return scene;
}

export async function createMountains() {
  const scene = [];
  const positions = [
    new THREE.Vector3(-50, 0, -40),
    new THREE.Vector3(50, 0, -25),
    new THREE.Vector3(0, 0, -105),
    new THREE.Vector3(-70, 0, -200),
  ];

  const mountain = await loadObj('/three/models/low/mountains-scaled.obj');
  positions.forEach((position) => {
    const obj = mountain.clone();
    obj.children[0].material = new THREE.MeshPhongMaterial({ color: '#8B4513' });
    obj.position.set(position.x, position.y, position.z);
    scene.push(obj);
  });
  return scene;
}

const collidables = [];
function addBarrier(length, road, x, y) {
  const barrierTex = new THREE.TextureLoader().load('/three/textures/barrier.jpg');
  barrierTex.anisotropy = 16;
  barrierTex.wrapS = THREE.RepeatWrapping;
  barrierTex.wrapT = THREE.RepeatWrapping;

  // barrierTex.repeat.x = 256;
  barrierTex.repeat.y = 50;

  const barrierMaterial = new THREE.MeshBasicMaterial({ map: barrierTex });

  const barriersBox = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, length, 5), barrierMaterial);
  barriersBox.rotation.y = Math.PI / 2;
  barriersBox.position.set(x, y, 0);
  barriersBox.material.visible = true;
  barriersBox.material.side = THREE.DoubleSide;

  collidables.push(barriersBox);
  road.add(barriersBox);
}

export function createRoad() {
  const roadTex = new THREE.TextureLoader().load('/three/textures/terrain/asphalt.jpg');
  roadTex.anisotropy = 16;
  roadTex.wrapS = THREE.RepeatWrapping;
  roadTex.wrapT = THREE.RepeatWrapping;

  const roadWidth = 20;

  // roadTex.repeat.y = 256;

  const material = new THREE.MeshBasicMaterial({ color: '#262626' });
  const roadMat = new THREE.MeshBasicMaterial({ map: roadTex });
  const road1 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 110), roadMat);
  road1.rotation.x = -Math.PI / 2;

  const road2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 80), roadMat);
  road2.rotation.x = -Math.PI / 2;
  road2.rotation.z = Math.PI / 2;


  const road3 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 70), roadMat);
  road3.rotation.x = -Math.PI / 2;

  const road4 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 100), roadMat);
  road4.rotation.x = -Math.PI / 2;
  road4.rotation.z = Math.PI / 2;

  const road6 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 85), roadMat);
  road6.rotation.x = -Math.PI / 2;
  road6.rotation.z = Math.PI / 2;


  const road7 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 100), roadMat);
  road7.rotation.x = -Math.PI / 2;

  const road8 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 80), roadMat);
  road8.rotation.x = -Math.PI / 2;

  const road9 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 85), roadMat);
  road9.rotation.x = -Math.PI / 2;
  road9.rotation.z = Math.PI / 2;

  const road10 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 30), roadMat);
  road10.rotation.x = -Math.PI / 2;
  road10.rotation.z = Math.PI / 2;

  const road11 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 50), roadMat);
  road11.rotation.x = -Math.PI / 2;
  road11.rotation.z = Math.PI / 2;

  const corner1 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 20), material);
  corner1.rotation.x = -Math.PI / 2;

  const corner2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 20), material);
  corner2.rotation.x = -Math.PI / 2;

  const corner3 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 20), material);
  corner3.rotation.x = -Math.PI / 2;

  const corner4 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 20), material);
  corner4.rotation.x = -Math.PI / 2;
  const corner5 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 20), material);
  corner5.rotation.x = -Math.PI / 2;
  const corner6 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 20), material);
  corner6.rotation.x = -Math.PI / 2;
  const corner7 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 20), material);
  corner7.rotation.x = -Math.PI / 2;
  const corner8 = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth, 20), material);
  corner8.rotation.x = -Math.PI / 2;


  //   const finishLine = new THREE.Mesh(new THREE.CubeGeometry(20, 5, 4), new THREE.MeshBasicMaterial({ color: 'red' }));

  //   finishLine.position.set(-100, 0, -60);


  road1.position.set(0, 0, -10);
  road2.position.set(50, 0, -75);
  road3.position.set(100, 0, -120);
  road4.position.set(40, 0, -165);
  road6.position.set(-52.5, 0, -165);
  road7.position.set(-105, 0, -105);
  road8.position.set(-155, 0, 5);
  road9.position.set(-52.5, 0, 55);
  road10.position.set(-130, 0, -45);
  road11.position.set(-120, 0, 55);

  corner1.position.set(0, 0, -75);
  corner2.position.set(100, 0, -75);
  corner3.position.set(100, 0, -165);
  corner4.position.set(-105, 0, -165);
  corner5.position.set(-155, 0, 55);
  corner6.position.set(0, 0, 55);
  corner7.position.set(-105, 0, -45);
  corner8.position.set(-155, 0, -45);


  addBarrier(130, road1, -10, 10);
  addBarrier(130, road1, 10, -10);
  addBarrier(100, road2, 10, 10);
  addBarrier(100, road2, -10, -10);
  addBarrier(110, road3, 10, 0);
  addBarrier(70, road3, -10, 0);
  addBarrier(100, road4, -10, 0);
  addBarrier(150, road4, 10, 5);
  addBarrier(85, road6, -10, 0);
  addBarrier(75, road6, 10, 25);
  addBarrier(120, road7, -10, 10);
  addBarrier(120, road7, 10, -10);
  addBarrier(120, road8, -10, 0);
  addBarrier(80, road8, 10, 0);
  addBarrier(125, road9, -10, 0);
  addBarrier(85, road9, 10, 0);
  addBarrier(50, road10, 10, 10);
  addBarrier(50, road10, -10, -10);
  addBarrier(50, road11, 10, 0);
  addBarrier(50, road11, -10, 20);

  // collidables.push(finishLine);

  return {
    collidables,
    sceneItems: [road1, road2, road3, road4, road6, road7, road8, road9, road10, road11, corner1, corner2, corner3, corner4, corner5, corner6, corner7, corner8],
  };
}
