import {createMountains, createTrees, createRoad} from './create-textures'
import {simulateKey, getRandomInt} from './util'



if (!WEBGL.isWebGLAvailable()) document.body.appendChild(WEBGL.getWebGLErrorMessage());

const renderer = new THREE.WebGLRenderer({ antialias: true });
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 500 );
const scene = new THREE.Scene();

const dolly = new THREE.Group();
dolly.position.set(-0.4,-0.4,0);
dolly.add(camera)

// anything that can be in a collision goes here
const collidableMeshList = [];

// fps counter
const stats = new Stats()

let carModel, controls,physObject

const envMap = new THREE.CubeTextureLoader()
	.setPath('/three/textures/skyboxsun25deg/')
	.load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);

const game = {
	gamepad: null,
	useGamepad: false,
	usesVR: false,
}

const lightHolder = new THREE.Group();
const clock = new THREE.Clock();

// car config
const car = new THREE.Car();
car.turningRadius = 75;
car.maxSpeed = 25
const carParts = {
	body: [],
	rims:[],
	glass: [],
};


const materialsLib = {
	main: [
		new THREE.MeshStandardMaterial( { color: 0xff4400, envMap, metalness: 0.9, roughness: 0.2, name: 'orange' } ),
		new THREE.MeshStandardMaterial( { color: 0x001166, envMap, metalness: 0.9, roughness: 0.2, name: 'blue' } ),
		new THREE.MeshStandardMaterial( { color: 0x990000, envMap, metalness: 0.9, roughness: 0.2, name: 'red' } ),
		new THREE.MeshStandardMaterial( { color: 0x000000, envMap, metalness: 0.9, roughness: 0.5, name: 'black' } ),
		new THREE.MeshStandardMaterial( { color: 0xffffff, envMap, metalness: 0.9, roughness: 0.5, name: 'white' } ),
		new THREE.MeshStandardMaterial( { color: 0x555555, envMap, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, name: 'metallic' } ),
	],

	glass: [
		new THREE.MeshStandardMaterial( { color: 0xffffff, envMap, metalness: 0.9, roughness: 0.1, opacity: 0.15, transparent: true, premultipliedAlpha: true, name: 'clear' } ),
		new THREE.MeshStandardMaterial( { color: 0x000000, envMap, metalness: 0.9, roughness: 0.1, opacity: 0.15, transparent: true, premultipliedAlpha: true, name: 'smoked' } ),
		new THREE.MeshStandardMaterial( { color: 0x001133, envMap, metalness: 0.9, roughness: 0.1, opacity: 0.15, transparent: true, premultipliedAlpha: true, name: 'blue' } ),
	],

}

function checkCollision() {
	let bounceVal = Math.abs(car.speed / 2)
	for (let i = 0; i < physObject.children.length; i++) {
		if (physObject.children[i].isMesh) {

		let object = physObject.children[i]

		let position = new THREE.Vector3();
		object.getWorldPosition(position)

		for (let vertexIndex = 0; vertexIndex < object.geometry.vertices.length; vertexIndex++)
		{
			let localVertex = object.geometry.vertices[vertexIndex].clone();
			let globalVertex = object.matrix.multiplyVector3(localVertex);

			let directionVector = globalVertex.sub( position );

			let ray = new THREE.Raycaster( position, directionVector.clone().normalize() );

			let collisionResults = ray.intersectObjects( collidableMeshList );



			if ( collisionResults.length > 0 && collisionResults[0].distance <= 1)
			{
				if (object.name == 'front') {
					//console.log(bounceVal)
					car.speed = -2
				} else {
					car.speed = 2
				}
			}

		}
		}
	}
}



async function initCar(useVR) {

	THREE.DRACOLoader.setDecoderPath( '/three/js/libs/draco/gltf/' );

	const loader = new THREE.GLTFLoader();
	loader.setDRACOLoader( new THREE.DRACOLoader() );
	const load = url => new Promise(res => loader.load(url, res))
	const gltf = await load('/three/models/gltf/ferrari.glb')

	carModel = gltf.scene.children[ 0 ];

	// add lightHolder to car so that the shadow will track the car as it moves
	carModel.add( lightHolder );

	if (useVR) carModel.add(dolly)
	else carModel.add(controls.getObject())
	
	const physGeom = new THREE.CubeGeometry(2, 0.5,4);
	const physMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' });
	physMaterial.visible = false;
	physObject = new THREE.Mesh( physGeom, physMaterial );


	const frontBlock = new THREE.Mesh(new THREE.CubeGeometry(2, 2.25,2.4,1,1,1), new THREE.MeshBasicMaterial({color:'red'}));
	frontBlock.position.z = -1
	frontBlock.name = 'front'
	frontBlock.visible = false;


	const backBlock = new THREE.Mesh(new THREE.CubeGeometry(2, 2.25,2,1,1,1), new THREE.MeshBasicMaterial({color:'black'}) );
	backBlock.position.z = 1
	backBlock.name = 'back'
	backBlock.visible = false;

	physObject.add(frontBlock)
	physObject.add(backBlock)
	physObject.add(carModel)

	car.setModel( physObject );

	carModel.traverse((child) => {
		if (!child.isMesh) return
		child.castShadow = true;
		child.receiveShadow = true;
		child.material.envMap = envMap;
	});

	// shadow
	const texture = new THREE.TextureLoader().load( '/three/models/gltf/ferrari_ao.png' );
	const shadow = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 0.655 * 4, 1.3 * 4 ).rotateX( - Math.PI / 2 ),
		new THREE.MeshBasicMaterial( { map: texture, opacity: 0.8, transparent: true } )
	);

	shadow.renderOrder = 2;
	carModel.add( shadow );

	scene.add( physObject );

	// car parts for material selection
	carParts.body.push( carModel.getObjectByName( 'body' ) );

	carParts.rims.push(
		carModel.getObjectByName( 'rim_fl' ),
		carModel.getObjectByName( 'rim_fr' ),
		carModel.getObjectByName( 'rim_rr' ),
		carModel.getObjectByName( 'rim_rl' ),
		carModel.getObjectByName( 'trim' ),
	);

	carParts.glass.push(carModel.getObjectByName('glass'));

	updateMaterials();

	// });

}



// set materials to the current values of the selection menus
function updateMaterials() {

	let bodyMat = materialsLib.main[3];
	let rimMat = materialsLib.main[3];
	let glassMat = materialsLib.glass[ 0 ];

	carParts.body.forEach( function ( part ) { part.material = bodyMat; } );
	carParts.rims.forEach( function ( part ) { part.material = rimMat; } );
	carParts.glass.forEach( function ( part ) { part.material = glassMat; } );

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function handleGamePadKeys(btn, key) {
	if (btn.pressed) {
		console.log('simulating', key)
		simulateKey('keydown', key)
	} else {
		simulateKey('keyup', key)
	}
}


function pollGamePad() {
	const [pad] = [...navigator.getGamepads()].filter(Boolean)
	console.log(pad)
	pad.buttons.forEach((btn, index) => {
		if (btn.pressed) console.log(pad.buttons.indexOf(btn), 'pressed')
		if (index === 0 || index === 7) handleGamePadKeys(btn, 38) // forward
		if (index === 3 || index === 6) handleGamePadKeys(btn, 40) // back
		if (index == 14) handleGamePadKeys(btn, 37) // left
		if (index == 15) handleGamePadKeys(btn, 39) // right
		if (index == 2) handleGamePadKeys(btn, 32)
	})
}

function update() {
	const delta = clock.getDelta();
	car.update( delta / 3 );
	lightHolder.rotation.y = -carModel.rotation.y;
	checkCollision()
	if (game.useGamepad) pollGamePad()
	stats.update();
	renderer.render(scene, camera);
}

async function init(useVR = false) {
	const container = document.getElementById('container');
	const blocker = document.getElementById('blocker')
	
	blocker.style.display = 'none'
	document.body.requestPointerLock()

	// if user presses esc, let them jump back in on PC
	container.addEventListener('click', () => document.body.requestPointerLock())


	controls = new THREE.PointerLockControls(camera);
	controls.getObject().position.set( -0.4, 1,0.25 )

	scene.background = envMap;


	const grassTex = THREE.ImageUtils.loadTexture('/three/textures/terrain/grasslight-big.jpg');
	grassTex.anisotropy = 16
	grassTex.wrapS = THREE.RepeatWrapping;
	grassTex.wrapT = THREE.RepeatWrapping;
	grassTex.repeat.x = 256;
	grassTex.repeat.y = 256;

	const groundMaterials = [new THREE.MeshBasicMaterial({map:grassTex})]
	const ground = new THREE.Mesh(new THREE.PlaneGeometry( 500, 500, 10,10), groundMaterials)
	ground.rotation.x = - Math.PI / 2;
	ground.position.y = -0.1


	scene.add(ground);
	scene.add(controls.getObject());

	const hemiLight = new THREE.HemisphereLight( 0x7c849b, 0xd7cbb1, 0.1 );
	hemiLight.position.set( 0, 1, 0 );
	scene.add(hemiLight);

	const shadowLight  = new THREE.DirectionalLight( 0xffffee, 0.1 );
	shadowLight.position.set( -1.5, 1.25, -1.5 );
	shadowLight.castShadow = true;
	shadowLight.shadow.width = 512;
	shadowLight.shadow.height = 512;
	shadowLight.shadow.camera.top = 2;
	shadowLight.shadow.camera.bottom = -2;
	shadowLight.shadow.camera.left = -2.5;
	shadowLight.shadow.camera.right = 2.5;
	shadowLight.shadow.camera.far = 5.75;
	shadowLight.shadow.bias = -0.025;

	lightHolder.add(shadowLight, shadowLight.target);


	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	renderer.vr.enabled = true;
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
	container.appendChild(stats.dom);

	await initCar(useVR);
	const road = createRoad()
	const [mountains, trees] = await Promise.all([createMountains(), createTrees()]);
	[...mountains, ...trees, ...road.sceneItems].forEach(obj => scene.add(obj))
	collidableMeshList.push(...road.collidables)


	window.addEventListener('resize', onWindowResize, false);

	renderer.setAnimationLoop(update);
}


const playVR = document.getElementById('play-vr')
const playBtn = document.getElementById('play')

playVR.addEventListener('click', () => init(true))
playBtn.addEventListener('click', () => init())

window.addEventListener("gamepadconnected", ev => {
	game.useGamepad = confirm('use connected gamepad?');
	console.log('Using gamepad:', game.useGamepad)
	game.gamepad = ev.gamepad
	console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
		game.gamepad.index, game.gamepad.id,
		game.gamepad.buttons.length, game.gamepad.axes.length,
	);
});
