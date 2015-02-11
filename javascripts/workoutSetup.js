// setup scene for workout
var SPHERE_RADIUS = 50;

var deviceControls;

var cameraMaxY = 400,
  cameraMinY = 200,
  cameraMaxX = 300,
  cameraMinX = -100;

var camera, scene, renderer, effect, mesh,
  lastTime = new Date(),
  sphereList = [];

function init () {
  var tunnel = new THREE.BoxGeometry( 600, 1200, 3000, 10, 10 );

  var material = new THREE.MeshBasicMaterial({
    color: 0xaffff,
    opacity: 0.5,
    wireframe: true,
    transparent: true
  })

  var tunnelMesh = new THREE.Mesh( tunnel, material );
  tunnelMesh.position.y = 300;
  tunnelMesh.position.z = -1200;

  //

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  // renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  effect = new THREE.StereoEffect( renderer );
  effect.eyeSeparation = 10;
  effect.setSize( window.innerWidth, window.innerHeight );

  //

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth /
    window.innerHeight, 1, 4000 );

  camera.position.y = 400;
  camera.position.z = 100;

  //

  deviceControls = new THREE.DeviceOrientationControls( camera );

  scene = new THREE.Scene();
  scene.add( tunnelMesh );

  window.addEventListener( 'resize', onWindowResize, false );

  startObstacles();
  addVideoFeed();
}

function startObstacles () {
  var lastY = cameraMaxY;

  setInterval(function(){
    var geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 5, 5)

    var material = new THREE.MeshBasicMaterial({
      color: 0xaff00,
      wireframe: true,
      wireframeLinewidth: 2
    });

    mesh = new THREE.Mesh( geometry, material );
    mesh.position.y = lastY === cameraMaxY ? cameraMinY : cameraMaxY;
    lastY = mesh.position.y;

    mesh.position.z = -1500;

    var position = {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z
      },
      target = {
        x: mesh.position.x,
        y: mesh.position.y,
        z: 3000
      };

    scene.add( mesh );
    sphereList.push(mesh);

    doTween(position, target, mesh, TWEEN.Easing.Circular.Out, 100000);

  }, 6000);
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  TWEEN.update();

  checkForCollision();

  deviceControls.update();

  effect.render( scene, camera );

}

function initGyro() {
  var increment = 100,
    position = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    },
    target = {
      x: 0,
      y: 0,
      z: 0
    },
    tween;

  var lastXAccel = false;

  gyro.frequency = 100;

  // some comments
  gyro.startTracking(function(o) {
    var xAccel = parseFloat(o.x.toFixed(3)),
      currentTime = new Date(),
      dAccel, timeElapsed;

    if (lastXAccel !== false && lastTime !== false) {
      timeElapsed = currentTime - lastTime;

      // 400 milliseconds
      if (timeElapsed > 400) {
        dAccel = xAccel - lastXAccel;

        // acceleration up
        if (dAccel >= 3) {

          // if camera not at top, move to top
          if (camera.position.y < cameraMaxY) {
            target.y = cameraMaxY;
            target.z = camera.position.z;

            doTween(position, target, camera, TWEEN.Easing.Circular.Out,
                300);

            lastTime = currentTime;
          }

        // acceleration down
        } else if (dAccel <= -3) {

          // if camera not at bottom, move to bottom
          if (camera.position.y > cameraMinY) {
            target.y = cameraMinY;
            target.z = camera.position.z;

            doTween(position, target, camera, TWEEN.Easing.Circular.Out,
                300);

            lastTime = currentTime;
          }


        }
      }
    }
    lastXAccel = xAccel;
  });
}

function doTween (position, target, obj, easing, time) {
  var tween = new TWEEN.Tween(position).to(target, time);

  tween.onUpdate(function(){
    obj.position.x = position.x;
    obj.position.y = position.y;
    obj.position.z = position.z;
  });

  tween.easing(easing);

  tween.start();
}

function addVideoFeed () {
  var videoSource = null,
    video = document.getElementById("video"),
    errBack = function(error) {
      console.log("Video capture error: ", error);
    };

  var getUserMedia = navigator.getUserMedia ?
      function(a, b, c) { navigator.getUserMedia(a, b, c); } :
      (navigator.webkitGetUserMedia ?
          function(a, b, c) { navigator.webkitGetUserMedia(a, b, c); } : null);

  MediaStreamTrack.getSources(function(sourceInfos) {
    var sourceInfo;

    for (var i = 0; i != sourceInfos.length; ++i) {
      sourceInfo = sourceInfos[i];

      if (sourceInfo.kind === 'video') {
        console.log(sourceInfo);
        videoSource = sourceInfo.id;

      } else {
        console.log('Some other kind of source: ', sourceInfo);
      }
    }

    getUserMedia.call(this, {
      video: {
        optional: [{sourceId: videoSource}]
      }
    }, function(stream) {
      console.log("getUserMedia");
      console.log(video);
      // window.stream = stream; // make stream available to console
      video.src = window.URL.createObjectURL(stream);
      video.play();
    }, errBack);

  });


}

function distance(obj1, obj2) {
  return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) +
      Math.pow(obj1.y - obj2.y, 2) +
      Math.pow(obj1.z - obj2.z, 2));
}

function checkForCollision () {
  var sphere;

  for (var i = 0; i < sphereList.length; i++) {
    sphere = sphereList[i];

    if (distance(camera.position, sphere.position) <= SPHERE_RADIUS) {
      sphere.material.color.r = 255;
      sphere.material.color.g = 0;
    }
  }
}

init();
animate();
initGyro();
