/*
 * Visualize.js
 * Nathaniel Foster
 *
 * Description: Visualize accelerometer data
 */

var camera, scene, renderer, point, deviceControls, effect,
  gridOne, gridTwo, gridThree;

function init () {

  // is webgl supported? // need to add Detector
  // if ( ! Detector.webgl ) {
  //   Detector.addGetWebGLMessage();
  // }

  /*
  *  SphereGeometry(radius, widthSegments, heightSegments, phiStart,
  *      phiLength, thetaStart, thetaLength)
  */
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild( renderer.domElement );

  effect = new THREE.StereoEffect( renderer );
  effect.eyeSeparation = 10;
  effect.setSize( window.innerWidth, window.innerHeight );

  //

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth /
    window.innerHeight, 1, 4000 );

  // camera.position.y = 400;
  camera.position.z = 400;
  camera.position.y = 200;

  //

  var material = new THREE.LineBasicMaterial({
    color: 0xaff00
  });

  var geometry = new THREE.Geometry();

  geometry.vertices.push(
    new THREE.Vector3( 0, 10, 0 ),
    new THREE.Vector3( 10, 20, 0 )
  );

  var line = new THREE.Line( geometry, material );
  scene.add(line);

  // create grid
  var size = 500;
  var step = 100;

  gridOne = new THREE.GridHelper( size, step );
  gridTwo = new THREE.GridHelper( size, step );
  gridThree = new THREE.GridHelper( size, step );

  gridOne.rotation.x = - Math.PI / 2;
  gridTwo.rotation.x = - Math.PI / 2;
  gridThree.rotation.x = - Math.PI / 2;

  gridTwo.position.z = -100;
  gridThree.position.z = 100;

  scene.add( gridOne );
  // scene.add( gridTwo );
  // scene.add( gridThree );


  deviceControls = new THREE.DeviceOrientationControls( camera );

  window.addEventListener( 'resize', onWindowResize, false );
}

function initGyro () {
  var POINT_RADIUS = 10;

  var prevXAccel = 0,
    prevYAccel = 0,
    prevZAccel = 0,
    prevX = 0,
    prevY = 0,
    prevZ = 0,
    x, y, z;

  var material = new THREE.LineBasicMaterial({
    color: 0xaff00
  });

  var materialZ = new THREE.LineBasicMaterial({
    color: 0xa00ff
  });

  var geometry = new THREE.Geometry();

  gyro.frequency = 100;

  // acceleration: x, y, z
  // position alpha, beta, gamma
  /*
   *  Gyro tracks six measurements
   *  acceleration: x, y, z
   *  device orientation: alpha, beta, gamma
   *  alpha: z-axis:    0 - 360
   *  beta:  x-axis: -180 - 180
   *  gamma: y-axis:  -90 -  90
   */
  gyro.startTracking(function(o) {
    var xAccel = parseFloat(o.x.toFixed(3)),
      yAccel = parseFloat(o.y.toFixed(3)),
      zAccel = parseFloat(o.z.toFixed(3)),
      currentTime = new Date(),
      threshold = .35,
      geometry, line,
      dAccel,
      sum;

    // var rates = instanceOfDeviceMotionEvent.rotationRate;

    // console.log("rates: ", rates);

    console.log("alpha: ", o.alpha);
    console.log("beta: ", o.beta);
    console.log("gamma: ", o.gamma);
      // console.log("y: ", yAccel);
      // console.log("z: ", zAccel);

    // remove noise, convert signal to 100, 0, -100
    xAccel = removeNoise(threshold, xAccel);
    yAccel = removeNoise(threshold, yAccel);
    zAccel = removeNoise(threshold, zAccel);

    // console.log("z-n: ", zAccel);
    // console.log("y-n: ", yAccel);
    if (xAccel - prevXAccel === 200) {
      // console.log("down");

    } else if (xAccel - prevXAccel === -200){
      // console.log("up");
    }

    // moving x position of line and camera
    x = prevX + POINT_RADIUS

    /*
     *  Mapping X acceleration
     *  create line between last two accelerations
     *  -mapping acceleration to y coordinate
     */
    geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3( prevX, prevXAccel, 0 ),
      new THREE.Vector3( x, xAccel, 0 )
    );
    line = new THREE.Line( geometry, material );
    scene.add(line);


    // Mapping Z Acceleration
    geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3( prevX, 0, prevZAccel ),
      new THREE.Vector3( x, 0, zAccel )
    );
    line = new THREE.Line( geometry, materialZ );
    scene.add(line);

    // move camera
    camera.position.x = x;
    gridOne.position.x = x;
    gridTwo.position.x = x;
    gridThree.position.x = x;

    // update previous position and acceleration
    prevX = x;
    prevXAccel = xAccel;
    prevZ = z;
    prevZAccel = zAccel;
  });
}

function animate () {

  requestAnimationFrame( animate );

  deviceControls.update();

  effect.render( scene, camera );

}

function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function removeNoise (threshold, accel) {
  if (accel <= threshold && accel >= -threshold) {
    accel = 0;

  } else {
    accel = accel >= threshold ? 100 : -100;
  }

  return accel;
}

init();
initGyro();
animate();
