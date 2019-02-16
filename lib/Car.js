const THREE = require('./three');

export default class Car {
  constructor(maxSpeed, acceleration, brakePower, turningRadius, keys) {
    this.enabled = true;

    this.controls = {
      brake: false,
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
    };

    this.elemNames = {
      flWheel: 'wheel_fl',
      frWheel: 'wheel_fr',
      rlWheel: 'wheel_rl',
      rrWheel: 'wheel_rr',
      steeringWheel: 'steering_wheel', // set to null to disable
    };


    this.steeringWheelSpeed = 1.5;
    this.maxSteeringRotation = 0.6;


    this.maxSpeedReverse = 0;
    this.accelerationReverse = 0;
    this.deceleration = 0;
    this.velocity = 0;

    this.controlKeys = {
      LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, BRAKE: 32,
    };

    this.wheelOrientation = 0;
    this.carOrientation = 0;

    this.root = null;

    this.frontLeftWheelRoot = null;
    this.frontRightWheelRoot = null;

    this.frontLeftWheel = new THREE.Group();
    this.frontRightWheel = new THREE.Group();
    this.backLeftWheel = null;
    this.backRightWheel = null;
    this.steeringWheel = null;
    this.wheelDiameter = 1;
    this.length = 1;
    this.loaded = false;

    // km/hr
    this.maxSpeed = maxSpeed || 180;
    this.maxSpeedReverse = -this.maxSpeed * 0.25;

    // m/s
    this.acceleration = this.velocity || 10;
    this.accelerationReverse = this.acceleration * 0.5;

    // metres
    this.turningRadius = turningRadius || 6;

    // m/s
    this.deceleration = this.acceleration * 2;

    // multiplied with deceleration, so breaking deceleration = ( acceleration * 2 * brakePower ) m/s
    this.brakePower = brakePower || 10;

    // exposed so that a user can use this for various effect, e.g blur
    this.speed = 0;

    // keys used to control car - by default the arrow keys and space to brake
    this.controlKeys = keys || this.controlKeys;

    // local axes of rotation - these are likely to vary between models
    this.wheelRotationAxis = 'x';
    this.wheelTurnAxis = 'z';
    this.steeringWheelTurnAxis = 'y';

    // if (client) {
    console.log('[CAR] is client');
    document.addEventListener('keydown', e => this.onKeyDown(e, this.controls), false);
    document.addEventListener('keyup', e => this.onKeyUp(e, this.controls), false);
    // }
  }

  onKeyDown(event, controls) {
    this.controls = controls;

    switch (event.keyCode) {
      case this.controlKeys.BRAKE:
        this.controls.brake = true;
        this.controls.moveForward = false;
        this.controls.moveBackward = false;
        break;

      case this.controlKeys.UP: this.controls.moveForward = true; break;

      case this.controlKeys.DOWN: this.controls.moveBackward = true; break;

      case this.controlKeys.LEFT: this.controls.moveLeft = true; break;

      case this.controlKeys.RIGHT: this.controls.moveRight = true; break;
    }
  }

  onKeyUp(event, controls) {
    this.controls = controls;
    switch (event.keyCode) {
      case this.controlKeys.BRAKE: this.controls.brake = false; break;

      case this.controlKeys.UP: this.controls.moveForward = false; break;

      case this.controlKeys.DOWN: this.controls.moveBackward = false; break;

      case this.controlKeys.LEFT: this.controls.moveLeft = false; break;

      case this.controlKeys.RIGHT: this.controls.moveRight = false; break;
    }
  }

  dispose() {
    document.removeEventListener('keydown', this.onKeyDown, false);
    document.removeEventListener('keyup', this.onKeyUp, false);
  }

  update(delta) {
    let k;

    if (!this.loaded || !this.enabled) return;

    this.brakingDeceleration = 1;

    if (this.controls.brake) this.brakingDeceleration = this.brakePower;

    if (this.controls.moveForward) {
      this.speed = THREE.Math.clamp(this.speed + delta * this.acceleration, this.maxSpeedReverse, this.maxSpeed);
      this.velocity = THREE.Math.clamp(this.velocity + delta, -1, 1);
    }

    if (this.controls.moveBackward) {
      this.speed = THREE.Math.clamp(this.speed - delta * this.accelerationReverse, this.maxSpeedReverse, this.maxSpeed);
      this.velocity = THREE.Math.clamp(this.velocity - delta, -1, 1);
    }

    if (this.controls.moveLeft) {
      this.wheelOrientation = THREE.Math.clamp(this.wheelOrientation + delta * this.steeringWheelSpeed, -this.maxSteeringRotation, this.maxSteeringRotation);
    }

    if (this.controls.moveRight) {
      this.wheelOrientation = THREE.Math.clamp(this.wheelOrientation - delta * this.steeringWheelSpeed, -this.maxSteeringRotation, this.maxSteeringRotation);
    }

    // this.speed decay
    if (!(this.controls.moveForward || this.controls.moveBackward)) {
      if (this.speed > 0) {
        k = this.exponentialEaseOut(this.speed / this.maxSpeed);

        this.speed = THREE.Math.clamp(this.speed - k * delta * this.deceleration * this.brakingDeceleration, 0, this.maxSpeed);
        this.velocity = THREE.Math.clamp(this.velocity - k * delta, 0, 1);
      } else {
        k = this.exponentialEaseOut(this.speed / this.maxSpeedReverse);

        this.speed = THREE.Math.clamp(this.speed + k * delta * this.accelerationReverse * this.brakingDeceleration, this.maxSpeedReverse, 0);
        this.velocity = THREE.Math.clamp(this.velocity + k * delta, -1, 0);
      }
    }

    // steering decay
    if (!(this.controls.moveLeft || this.controls.moveRight)) {
      if (this.wheelOrientation > 0) {
        this.wheelOrientation = THREE.Math.clamp(this.wheelOrientation - delta * this.steeringWheelSpeed, 0, this.maxSteeringRotation);
      } else {
        this.wheelOrientation = THREE.Math.clamp(this.wheelOrientation + delta * this.steeringWheelSpeed, -this.maxSteeringRotation, 0);
      }
    }

    const forwardDelta = -this.speed * delta;
    // console.log(forwardDelta)

    this.carOrientation -= (forwardDelta * this.turningRadius * 0.02) * this.wheelOrientation;

    // movement of car
    this.root.position.x += Math.sin(this.carOrientation) * forwardDelta * this.length;
    this.root.position.z += Math.cos(this.carOrientation) * forwardDelta * this.length;

    // angle of car
    this.root.rotation.y = this.carOrientation;

    // wheels rolling
    const angularSpeedRatio = -2 / this.wheelDiameter;

    const wheelDelta = forwardDelta * angularSpeedRatio * length;

    this.frontLeftWheel.rotation[this.wheelRotationAxis] -= wheelDelta;
    this.frontRightWheel.rotation[this.wheelRotationAxis] -= wheelDelta;
    this.backLeftWheel.rotation[this.wheelRotationAxis] -= wheelDelta;
    this.backRightWheel.rotation[this.wheelRotationAxis] -= wheelDelta;

    // rotation while steering
    this.frontLeftWheelRoot.rotation[this.wheelTurnAxis] = this.wheelOrientation;
    this.frontRightWheelRoot.rotation[this.wheelTurnAxis] = this.wheelOrientation;

    this.steeringWheel.rotation[this.steeringWheelTurnAxis] = -this.wheelOrientation * 6;
  }

  setModel(model, elemNames) {
    if (elemNames) this.elemNames = elemNames;

    this.root = model;

    this.setupWheels();
    this.computeDimensions();

    this.loaded = true;
  }

  getCarVariables() {
    return {
      delta: this.delta,
      speed: this.speed,
      velocity: this.velocity,
      acceleration: this.acceleration,
      steeringWheelSpeed: this.steeringWheelSpeed,
      wheelOrientation: this.wheelOrientation,
      carOrientation: this.carOrientation,
    };
  }

  getCarVars() {
    return {
      delta: this.delta,
      steeringWheelSpeed: this.steeringWheelSpeed,
      wheelOrientation: this.wheelOrientation,
      carOrientation: this.carOrientation,
      x: this.root.position.x,
      z: this.root.position.z,
    };
  }

  setCarVars(vars) {
    this.steeringWheelSpeed = vars.steeringWheelSpeed;
    this.wheelOrientation = vars.wheelOrientation;
    this.carOrientation = vars.carOrientation;
    this.root.position.x = vars.x;
    this.root.position.z = vars.z;
  }

  setCarVariables(vars) {
    this.speed = vars.speed;
    this.velocity = vars.velocity;
    this.acceleration = vars.acceleration;
    this.steeringWheelSpeed = vars.steeringWheelSpeed;
    this.wheelOrientation = vars.wheelOrientation;
    this.carOrientation = vars.carOrientation;
  }

  setupWheels() {
    this.frontLeftWheelRoot = this.root.getObjectByName(this.elemNames.flWheel);
    this.frontRightWheelRoot = this.root.getObjectByName(this.elemNames.frWheel);
    this.backLeftWheel = this.root.getObjectByName(this.elemNames.rlWheel);
    this.backRightWheel = this.root.getObjectByName(this.elemNames.rrWheel);

    if (this.elemNames.steeringWheel !== null) this.steeringWheel = this.root.getObjectByName(this.elemNames.steeringWheel);

    while (this.frontLeftWheelRoot.children.length > 0) this.frontLeftWheel.add(this.frontLeftWheelRoot.children[0]);
    while (this.frontRightWheelRoot.children.length > 0) this.frontRightWheel.add(this.frontRightWheelRoot.children[0]);

    this.frontLeftWheelRoot.add(this.frontLeftWheel);
    this.frontRightWheelRoot.add(this.frontRightWheel);
  }

  computeDimensions() {
    const bb = new THREE.Box3().setFromObject(this.frontLeftWheelRoot);

    let size = new THREE.Vector3();
    bb.getSize(size);

    this.wheelDiameter = Math.max(size.x, size.y, size.z);

    bb.setFromObject(this.root);

    size = bb.getSize(size);
    length = Math.max(size.x, size.y, size.z);
  }

  exponentialEaseOut(k) {
    return k === 1 ? 1 : -Math.pow(2, -10 * k) + 1;
  }
}
