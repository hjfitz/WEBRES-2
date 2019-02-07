
const objLoader = new THREE.OBJLoader();

const loadObj = url => new Promise((res) => objLoader.load(url, res))


export async function createTrees() {
	const trees = []
	const scene = []

	const positions = [
		new THREE.Vector3 (-250, 0,-166),
		new THREE.Vector3 (-292,0,6),
		new THREE.Vector3 (292,0,188),
		new THREE.Vector3 (-249,0,-19),
		new THREE.Vector3 (198,0,188),
		new THREE.Vector3 (72,0,-47),
		new THREE.Vector3 (-109,0,208),
		new THREE.Vector3 (-119,0,51),
		new THREE.Vector3 (264,0,43),
		new THREE.Vector3 (32,0,65),
		new THREE.Vector3 (-297,0,109),
		new THREE.Vector3 (14,0,-297),
		new THREE.Vector3( 287,0,139),
		new THREE.Vector3 (269, 0,-205),
		new THREE.Vector3 (-297,0,-61),
		new THREE.Vector3 (257,0,-55),
		new THREE.Vector3 (-287,0,-20),
		new THREE.Vector3 (183,0,65),
		new THREE.Vector3 (-171,0,114),
		new THREE.Vector3 (251,0,196),
		new THREE.Vector3 (126,0,-21),
		new THREE.Vector3 (-169,0,269),
		new THREE.Vector3 (-291,0,-7),
	]

	const tree = await loadObj('/three/models/low/tree.obj')
	positions.forEach((position) => {
		let treeObj = tree.clone()
		treeObj.children[0].material = new THREE.MeshPhongMaterial({color:'#004c00'})
		var treeBox = new THREE.Mesh( new THREE.CylinderGeometry( 1, 1, 10, 5), new THREE.MeshBasicMaterial({color:'green'}) );
		treeBox.add(treeObj)
		treeBox.material.visible = false;
		treeBox.material.side = THREE.DoubleSide;
		treeBox.position.set(position.x,0,position.z)
		scene.push(treeBox)
		trees.push(treeBox)
	})
	return scene
}

export async function createMountains() {
	const scene = []
	const positions = [
		new THREE.Vector3(-50,0,-40),
		new THREE.Vector3(50,0,-25),
		new THREE.Vector3(0,0,-105),
		new THREE.Vector3(-70,0,-200),
	]

	const mountain = await loadObj('/three/models/low/mountains-scaled.obj')
	positions.forEach((position) => {
		let obj = mountain.clone()
		obj.children[0].material = new THREE.MeshPhongMaterial({color:'#8B4513'})
		obj.position.set(position.x,position.y,position.z)
		scene.push(obj)
	})
	return scene
}

const collidables = []
export function createRoad() {
	let roadTex = new THREE.TextureLoader().load('/three/textures/terrain/asphalt.jpg');
	roadTex.anisotropy = 16
	roadTex.wrapS = THREE.RepeatWrapping;
	roadTex.wrapT = THREE.RepeatWrapping;

	const roadWidth = 20

	//roadTex.repeat.y = 256;


	let roadMat = new THREE.MeshBasicMaterial({map:roadTex});
	let road1 = new THREE.Mesh(new THREE.PlaneBufferGeometry( roadWidth, 100 ), roadMat);
	road1.rotation.x = - Math.PI / 2;

	let road2 = new THREE.Mesh(new THREE.PlaneBufferGeometry( roadWidth, 130 ), roadMat);
	road2.rotation.x = - Math.PI / 2;
	road2.rotation.z = Math.PI / 2;


	let road3 = new THREE.Mesh(new THREE.PlaneBufferGeometry( roadWidth, 120 ), roadMat);
	road3.rotation.x = - Math.PI / 2;

	let road4 = new THREE.Mesh(new THREE.PlaneBufferGeometry( roadWidth, 110 ), roadMat);
	road4.rotation.x = - Math.PI / 2;
	road4.rotation.z = Math.PI / 2;


	let road5 = new THREE.Mesh(new THREE.PlaneBufferGeometry( roadWidth, 50 ), roadMat);
	road5.rotation.x = - Math.PI / 2;

	let road6 = new THREE.Mesh(new THREE.PlaneBufferGeometry( roadWidth, 100 ), roadMat);
	road6.rotation.x = - Math.PI / 2;
	road6.rotation.z = Math.PI / 2;


	let road7 = new THREE.Mesh(new THREE.PlaneBufferGeometry( roadWidth, 100 ), roadMat);
	road7.rotation.x = - Math.PI / 2;


	let finishLine = new THREE.Mesh( new THREE.CubeGeometry(20, 5,4), new THREE.MeshBasicMaterial({color:'red'}))

	finishLine.position.set(-100,0,-60)


	road1.position.set(0,0,-20)
	road2.position.set(45,0,-75)
	road3.position.set(100,0,-130)
	road4.position.set(40,0,-180)
	road5.position.set(-20,0,-170)
	road6.position.set(-40,0,-140)
	road7.position.set(-100,0,-100)

	


	addBarrier(120,road1,-10,5)
	addBarrier(80,road1,10,5)
	addBarrier(100,road2,10,5)
	addBarrier(110,road2,-10,-20)
	addBarrier(140,road3,10,5)
	addBarrier(87,road3,-10,-2)
	addBarrier(100,road4,-10,0)
	addBarrier(150,road4,10,-5)
	addBarrier(45,road5,-10,-0)
	addBarrier(45,road5,10,-25)
	addBarrier(100,road6,-10,0)
	addBarrier(80,road6,10,30)
	addBarrier(130,road7,-10,30)
	addBarrier(95,road7,10,-30)

	collidables.push(finishLine)

	return {
		collidables,
		sceneItems: [road1, road2, road3, road4, road5, road6, road7, finishLine],
	}
}

function addBarrier(length, road, x,y) {
	const barrierTex = new THREE.TextureLoader().load('/three/textures/barrier.jpg')
	barrierTex.anisotropy = 16
	barrierTex.wrapS = THREE.RepeatWrapping;
	barrierTex.wrapT = THREE.RepeatWrapping;

	//barrierTex.repeat.x = 256;
	barrierTex.repeat.y = 50;

	let barrierMaterial = new THREE.MeshBasicMaterial({ map: barrierTex });

	var barriersBox = new THREE.Mesh( new THREE.PlaneBufferGeometry(2, length, 5), barrierMaterial );
	barriersBox.rotation.y = Math.PI / 2;
	barriersBox.position.set(x,y,0)
	barriersBox.material.visible = true
	barriersBox.material.side = THREE.DoubleSide;

	collidables.push(barriersBox)
	road.add(barriersBox)
}
 