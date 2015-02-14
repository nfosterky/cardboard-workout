/*
 * Visualize.js
 * Nathaniel Foster
 *
 * Description: Visualize accelerometer data
 */

var camera, scene, renderer, point, deviceControls, effect;

function init () {
  /*
  *  SphereGeometry(radius, widthSegments, heightSegments, phiStart,
  *      phiLength, thetaStart, thetaLength)
  */


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

  //

  var material = new THREE.LineBasicMaterial({
    color: 0xaff00
  });

  var geometry = new THREE.Geometry();

  geometry.vertices.push(
    new THREE.Vector3( 0, 10, 0 ),
    new THREE.Vector3( 10, 20, 0 ),
    new THREE.Vector3( 20, 40, 0 ),
    new THREE.Vector3( 30, 20, 0 ),
    new THREE.Vector3( 40, 10, 0 ),
    new THREE.Vector3( 50, 0, 0 )
  );

  var line = new THREE.Line( geometry, material );

  scene = new THREE.Scene();

  scene.add(line);

  deviceControls = new THREE.DeviceOrientationControls( camera );

  window.addEventListener( 'resize', onWindowResize, false );
}

function initGyro() {
  var POINT_RADIUS = 10;

  var listYAccelerations = [],
    prevXAccel = 0,
    prevX = 0,
    x;

  // var geometry = new THREE.SphereGeometry(POINT_RADIUS, 10, 10);
  //
  // var material = new THREE.MeshBasicMaterial({
  //   color: 0xaff00,
  //   wireframe: true
  // });

  var material = new THREE.LineBasicMaterial({
    color: 0xaff00
  });

  var geometry = new THREE.Geometry();

  gyro.frequency = 100;

  // some comments
  gyro.startTracking(function(o) {
    var xAccel = parseFloat(o.x.toFixed(3)),
      currentTime = new Date(),
      threshold = .35,
      dAccel,
      sum;

    if (xAccel <= threshold && xAccel >= -threshold) {
      xAccel = 0;
    }

    // mesh = new THREE.Mesh( geometry, material );
    //

    x = prevX + POINT_RADIUS

    // mesh.position.x = lastMeshX;
    // mesh.position.y = xAccel * 20;

    // scene.add(mesh);

    // camera.position.x = prevX;



    xAccel = Math.floor(xAccel * 10);
    console.log(prevXAccel, " ", xAccel);

    var geometry = new THREE.Geometry();

    geometry.vertices.push(
      new THREE.Vector3( prevX, prevXAccel, 0 ),
      new THREE.Vector3( x, xAccel, 0 )
    );

    var line = new THREE.Line( geometry, material );
    camera.position.x = x;
    // line.position.x = x;
    console.log(line)
    scene.add(line);

    prevX = x;
    prevXAccel = xAccel;
  });
}

function animate() {

  requestAnimationFrame( animate );

  deviceControls.update();

  effect.render( scene, camera );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

init();
initGyro();
animate();
