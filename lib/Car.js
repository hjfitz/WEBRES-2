


// private variables
let steeringWheelSpeed = 1.5;
let maxSteeringRotation = 0.6;

let acceleration = 0;

let maxSpeedReverse, accelerationReverse, deceleration;

let controlKeys = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, BRAKE: 32 };

let wheelOrientation = 0;
let carOrientation = 0;

let root = null;

let frontLeftWheelRoot = null;
let frontRightWheelRoot = null;

let frontLeftWheel = new THREE.Group();
let frontRightWheel = new THREE.Group();
let backLeftWheel = null;
let backRightWheel = null;
let steeringWheel = null;
let wheelDiameter = 1;
let length = 1;

let loaded = false;


export default class Car {

  constructor(maxSpeed, acceleration, brakePower, turningRadius, keys) {
    this.enabled = true;

    this.controls = {
      brake: false,
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false
    };

    this.elemNames = {
      flWheel: 'wheel_fl',
      frWheel: 'wheel_fr',
      rlWheel: 'wheel_rl',
      rrWheel: 'wheel_rr',
      steeringWheel: 'steering_wheel', // set to null to disable
    };

    // km/hr
    this.maxSpeed = maxSpeed || 180;
    maxSpeedReverse = - this.maxSpeed * 0.25;

    // m/s
    this.acceleration = acceleration || 10;
    accelerationReverse = this.acceleration * 0.5;

    // metres
    this.turningRadius = turningRadius || 6;

    // m/s
    deceleration = this.acceleration * 2;

    // multiplied with deceleration, so breaking deceleration = ( acceleration * 2 * brakePower ) m/s
    this.brakePower = brakePower || 10;

    // exposed so that a user can use this for various effect, e.g blur
    this.speed = 0;

    // keys used to control car - by default the arrow keys and space to brake
    controlKeys = keys || controlKeys;

    // local axes of rotation - these are likely to vary between models
    this.wheelRotationAxis = 'x';
    this.wheelTurnAxis = 'z';
    this.steeringWheelTurnAxis = 'y';

    document.addEventListener( 'keydown', (e) => this.onKeyDown(e, this.controls), false );
    document.addEventListener( 'keyup',(e) => this.onKeyUp(e, this.controls), false );
  }

  onKeyDown ( event, controls) {

    this.controls = controls

    switch ( event.keyCode ) {

      case controlKeys.BRAKE:
        this.controls.brake = true;
        this.controls.moveForward = false;
        this.controls.moveBackward = false;
        break;

      case controlKeys.UP: this.controls.moveForward = true; break;

      case controlKeys.DOWN: this.controls.moveBackward = true; break;

      case controlKeys.LEFT: this.controls.moveLeft = true; break;

      case controlKeys.RIGHT: this.controls.moveRight = true; break;

    }

  }

  onKeyUp( event, controls) {

    this.controls = controls
    switch ( event.keyCode ) {

      case controlKeys.BRAKE: this.controls.brake = false; break;

      case controlKeys.UP: this.controls.moveForward = false; break;

      case controlKeys.DOWN: this.controls.moveBackward = false; break;

      case controlKeys.LEFT: this.controls.moveLeft = false; break;

      case controlKeys.RIGHT: this.controls.moveRight = false; break;

    }
  }

  dispose() {

    document.removeEventListener( 'keydown', this.onKeyDown, false );
    document.removeEventListener( 'keyup', this.onKeyUp, false );

  }

  update( delta ) {

    if ( ! loaded || ! this.enabled ) return;

    var brakingDeceleration = 1;

    if ( this.controls.brake ) brakingDeceleration = this.brakePower;

    if ( this.controls.moveForward ) {

      this.speed = THREE.Math.clamp( this.speed + delta * this.acceleration, maxSpeedReverse, this.maxSpeed );
      acceleration = THREE.Math.clamp( acceleration + delta, - 1, 1 );

    }

    if ( this.controls.moveBackward ) {

      this.speed = THREE.Math.clamp( this.speed - delta * accelerationReverse, maxSpeedReverse, this.maxSpeed );
      acceleration = THREE.Math.clamp( acceleration - delta, - 1, 1 );

    }

    if ( this.controls.moveLeft ) {

      wheelOrientation = THREE.Math.clamp( wheelOrientation + delta * steeringWheelSpeed, - maxSteeringRotation, maxSteeringRotation );

    }

    if ( this.controls.moveRight ) {

      wheelOrientation = THREE.Math.clamp( wheelOrientation - delta * steeringWheelSpeed, - maxSteeringRotation, maxSteeringRotation );

    }

    // this.speed decay
    if ( ! ( this.controls.moveForward || this.controls.moveBackward ) ) {

      if ( this.speed > 0 ) {

        var k = this.exponentialEaseOut( this.speed / this.maxSpeed );

        this.speed = THREE.Math.clamp( this.speed - k * delta * deceleration * brakingDeceleration, 0, this.maxSpeed );
        acceleration = THREE.Math.clamp( acceleration - k * delta, 0, 1 );

      } else {

        var k = this.exponentialEaseOut( this.speed / maxSpeedReverse );

        this.speed = THREE.Math.clamp( this.speed + k * delta * accelerationReverse * brakingDeceleration, maxSpeedReverse, 0 );
        acceleration = THREE.Math.clamp( acceleration + k * delta, - 1, 0 );

      }

    }

    // steering decay
    if ( ! ( this.controls.moveLeft || this.controls.moveRight ) ) {

      if ( wheelOrientation > 0 ) {

        wheelOrientation = THREE.Math.clamp( wheelOrientation - delta * steeringWheelSpeed, 0, maxSteeringRotation );

      } else {

        wheelOrientation = THREE.Math.clamp( wheelOrientation + delta * steeringWheelSpeed, - maxSteeringRotation, 0 );

      }

    }

    var forwardDelta = - this.speed * delta;

    carOrientation -= ( forwardDelta * this.turningRadius * 0.02 ) * wheelOrientation;

    // movement of car
    root.position.x += Math.sin( carOrientation ) * forwardDelta * length;
    root.position.z += Math.cos( carOrientation ) * forwardDelta * length;

    // angle of car
    root.rotation.y = carOrientation;

    // wheels rolling
    var angularSpeedRatio = - 2 / wheelDiameter;

    var wheelDelta = forwardDelta * angularSpeedRatio * length;

    frontLeftWheel.rotation[ this.wheelRotationAxis ] -= wheelDelta;
    frontRightWheel.rotation[ this.wheelRotationAxis ] -= wheelDelta;
    backLeftWheel.rotation[ this.wheelRotationAxis ] -= wheelDelta;
    backRightWheel.rotation[ this.wheelRotationAxis ] -= wheelDelta;

    // rotation while steering
    frontLeftWheelRoot.rotation[ this.wheelTurnAxis ] = wheelOrientation;
    frontRightWheelRoot.rotation[ this.wheelTurnAxis ] = wheelOrientation;

    steeringWheel.rotation[ this.steeringWheelTurnAxis ] = -wheelOrientation * 6;

  }

  setModel(model, elemNames) {
    if ( elemNames ) this.elemNames = elemNames;

    root = model;

    this.setupWheels();
    this.computeDimensions();

    loaded = true;
  }

  setupWheels() {
    frontLeftWheelRoot = root.getObjectByName( this.elemNames.flWheel );
    frontRightWheelRoot = root.getObjectByName( this.elemNames.frWheel );
    backLeftWheel = root.getObjectByName( this.elemNames.rlWheel );
    backRightWheel = root.getObjectByName( this.elemNames.rrWheel );

    if ( this.elemNames.steeringWheel !== null ) steeringWheel = root.getObjectByName( this.elemNames.steeringWheel );

    while ( frontLeftWheelRoot.children.length > 0 ) frontLeftWheel.add( frontLeftWheelRoot.children[ 0 ] );
    while ( frontRightWheelRoot.children.length > 0 ) frontRightWheel.add( frontRightWheelRoot.children[ 0 ] );

    frontLeftWheelRoot.add( frontLeftWheel );
    frontRightWheelRoot.add( frontRightWheel );
  }

  computeDimensions() {
    var bb = new THREE.Box3().setFromObject( frontLeftWheelRoot );

    var size = new THREE.Vector3();
    bb.getSize( size );

    wheelDiameter = Math.max( size.x, size.y, size.z );

    bb.setFromObject( root );

    size = bb.getSize( size );
    length = Math.max( size.x, size.y, size.z );
  }

  exponentialEaseOut( k ) {
    return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1;
  }
}