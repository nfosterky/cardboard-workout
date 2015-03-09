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
  camera.position.z = 600;
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

  var materialY = new THREE.LineBasicMaterial({
    color: 0xff0000
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
    var xAccel = parseFloat(o.y.toFixed(3)),  // mapping x to y
      yAccel = parseFloat(o.x.toFixed(3)),    // mapping y to x
      zAccel = parseFloat(o.z.toFixed(3)),
      currentTime = new Date(),
      threshold = 0.8,
      camX = camera.position.x,  // accelY
      camY = camera.position.y,  // accelX
      camZ = camera.position.z,  // accelZ
      geometry, line,
      dAccel,
      sum;

    // console.log("alpha: ", o.alpha);
    // console.log("beta: ", o.beta);
    // console.log("gamma: ", o.gamma);

    // remove noise, convert signal to 100, 0, -100
    xAccel = removeNoise(threshold, xAccel);
    yAccel = removeNoise(threshold, yAccel);
    zAccel = removeNoise(threshold, zAccel);

    if (xAccel - prevXAccel === 200) {
      // console.log("left");
      camX -= 100;

    } else if (xAccel - prevXAccel === -200){
      // console.log("right");
      camX += 100;
    }

    if (yAccel - prevYAccel === 200) {
      // console.log("down");
      camY -= 100;

    } else if (yAccel - prevYAccel === -200){
      // console.log("up");
      camY += 100;
    }

    if (zAccel - prevZAccel === 200) {
      // console.log("back");
      camZ -= 100;

    } else if (zAccel - prevZAccel === -200){
      // console.log("forward");
      camZ += 100;
    } else {
      camZ = 0;
    }


    var origin = {
      x: prevX,
      z: prevZ
    },
    destinaton;

    // console.log("beta: ", o.beta);
    // console.log("gamma: ", o.gamma);
    var alpha = Math.round(o.alpha);
    console.log("alpha: ", alpha);
    if (camZ !== 0) {
      // orgin, angle, distance
      destination = getDestination(origin, alpha, camZ);
      console.log("origin: ", origin);
      console.log("alpha: ", alpha);
      console.log("destination: ", destination);
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
      new THREE.Vector3( prevX, prevXAccel, 5 ),
      new THREE.Vector3( x, xAccel, 5 )
    );
    line = new THREE.Line( geometry, material );
    scene.add(line);

    // Mapping Y acceleration
    geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3( prevX, -200 + prevYAccel, 5 ),
      new THREE.Vector3( x, -200 + yAccel, 5 )
    );
    line = new THREE.Line( geometry, materialY );
    scene.add(line);

    // Mapping Z Acceleration
    geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3( prevX, 200 + prevZAccel, 5 ),
      new THREE.Vector3( x, 200 + zAccel, 5 )
    );
    line = new THREE.Line( geometry, materialZ );
    scene.add(line);

    // move camera
    camera.position.x = x;  //camX + POINT_RADIUS;
    // camera.position.y = camY;
    // camera.position.z = camZ;

    gridOne.position.x = x;
    gridTwo.position.x = x;
    gridThree.position.x = x;

    // update previous position and acceleration
    prevX = x;
    prevXAccel = xAccel;
    prevY = camera.position.y;
    prevYAccel = yAccel;
    prevZ = camera.position.z;
    prevZAccel = zAccel;

  });
}

// takes origin which has x and z coords moves distance at angle of rotation
// returns new point
function getDestination (origin, angle, distance) {
  var sin = sin(angle),
      cos = cos(angle),
      newX = origin.z * sin + origin.x * cos,
      newZ = origin.z * cos + origin.x * sin;

  return {
    x: newX,
    z: newZ
  };
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
