// setup scene for workout
var SPHERE_RADIUS = 50;

var cameraMaxY = 400,
  cameraMinY = 200,
  lastTime = new Date(),
  sphereList = [];

var camera, scene, renderer, effect, sphere, deviceControls;

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
  document.body.appendChild( renderer.domElement );

  effect = new THREE.StereoEffect( renderer );
  effect.eyeSeparation = 10;
  effect.setSize( window.innerWidth, window.innerHeight );

  //

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth /
    window.innerHeight, 1, 4000 );

  camera.position.y = 400;
  camera.position.z = 100;
  // camera.position.y = 3000;
  // camera.position.z = -800;

  //

  deviceControls = new THREE.DeviceOrientationControls( camera );

  scene = new THREE.Scene();
  scene.add( tunnelMesh );

  window.addEventListener( 'resize', onWindowResize, false );

  makeSpheres(2);
  startSpheres();

  addVideoFeed();
}
var spheres = [];

function makeSpheres (numToMake) {
  var geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 5, 5),
    lastY = cameraMaxY,
    position, target;

  var material = new THREE.MeshBasicMaterial({
    color: 0xaff00,
    wireframe: true,
    wireframeLinewidth: 2
  });

  var sphere = {};
  // material.color = new THREE.Color( 0xaff00 );
  for (var i = 0; i < numToMake; i++) {
    sphere = new THREE.Mesh( geometry, material );
    sphere.position.z = -3000;
    sphere.position.y = lastY === cameraMaxY ? cameraMinY : cameraMaxY;
    lastY = sphere.position.y;

    scene.add( sphere );
    sphereList[i] = sphere;
  }
}

function startSpheres () {
  var sphereIndex = 0;

  setInterval(function(){
    sphere = sphereList[sphereIndex];

    if (sphereIndex < sphereList.length) {
      sphereIndex++;

    } else {
      sphereIndex = 0;
    }

    position = {
      x: sphere.position.x,
      y: sphere.position.y,
      z: sphere.position.z
    };

    target = {
      x: sphere.position.x,
      y: sphere.position.y,
      z: 1000
    };

    doTween(position, target, sphere, TWEEN.Easing.Circular.Out, 5000);

  }, 5000);
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
    lastXAccel = false,
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

  // frequency set in milliseconds
  gyro.frequency = 100;

  gyro.startTracking(function(o) {
    var xAccel = parseFloat(o.x.toFixed(3)),
      currentTime = new Date(),
      threshold = .35,
      dAccel, timeElapsed;

    xAccel = removeNoise(threshold, xAccel);

    // can I init lastXAccel and lastTime to zero and remove this check?
    if (lastXAccel !== false && lastTime !== false) {
      timeElapsed = currentTime - lastTime;

      // 400 milliseconds
      if (timeElapsed > 400) {
        dAccel = xAccel - lastXAccel;

        // acceleration up
        // if (dAccel >= 3) {
        if (dAccel === -200) {

          // if camera not at top, move to top
          if (camera.position.y < cameraMaxY) {
            target.y = cameraMaxY;
            target.z = camera.position.z;

            doTween(position, target, camera, TWEEN.Easing.Circular.Out,
                300);

            lastTime = currentTime;
          }

        // acceleration down
        // } else if (dAccel <= -3) {
        } else if (dAccel === 200) {

          // if camera not at bottom, move to bottom
          if (camera.position.y > cameraMinY) {
            target.y = cameraMinY;
            target.z = camera.position.z;

            // animate camera movement
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

function removeNoise (threshold, accel) {
  if (accel <= threshold && accel >= -threshold) {
    accel = 0;

  } else {
    accel = accel >= threshold ? 100 : -100;
  }

  return accel;
}

function doTween (position, target, obj, easing, time) {

  // TODO: This is not being called, find out why
  function handleComplete (e) {
    console.log("complete");
    console.log(e);
    console.log(this);
  }

  var tween = new TWEEN.Tween(position)
      .to(target, time);
      // .call(handleComplete);

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
    videoLeft = document.getElementById("video_left"),
    videoRight = document.getElementById("video_right"),
    errBack = function(error) {
      console.log("Video capture error: ", error);
    };

  var getUserMedia = null;

  if (navigator.getUserMedia) {
    getUserMedia = function(a, b, c) {
      navigator.getUserMedia(a, b, c);
    }

  } else if (navigator.webkitGetUserMedia) {
    getUserMedia = function(a, b, c) {
      navigator.webkitGetUserMedia(a, b, c);
    }
  }


  MediaStreamTrack.getSources(function(sourceInfos) {
    var sourceInfo;

    // find last video source - might need to add check, last video might not
    // always be what we want?
    for (var i = 0; i < sourceInfos.length; i++) {
      sourceInfo = sourceInfos[i];

      if (sourceInfo.kind === 'video') {
        videoSource = sourceInfo.id;

      } else {
        console.log('Some other kind of source: ', sourceInfo);
      }
    }

    var media = { video: { optional: [{sourceId: videoSource}] } };

    getUserMedia(media, function(stream) {
      var url = window.URL.createObjectURL(stream);

      videoLeft.src = url;
      videoLeft.play();

      videoRight.src = url;
      videoRight.play();

    }, errBack);
  });
}

function distance(p1, p2) {
  return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2) +
            Math.pow(p1.z - p2.z, 2)
         );
}

function checkForCollision () {
  var target = { x: 0, y: 0, z: -3000 },
    sphere;

  for (var i = 0; i < sphereList.length; i++) {
    sphere = sphereList[i];

    // collision
    if (distance(camera.position, sphere.position) <= SPHERE_RADIUS) {
      console.log("collision");
      target.y = sphere.position.y;
      doTween(sphere.position, target, sphere, TWEEN.Easing.Circular.Out, 5000);
      // sphere.material.color.r = 255;
      // sphere.material.color.g = 0;
    }
  }
}

function removeObject(object) {
  var selectedObject = scene.getObjectByName(object.name);

  console.log("remove object");
  console.log(object);

  scene.remove( selectedObject );
}

init();
animate();
initGyro();
