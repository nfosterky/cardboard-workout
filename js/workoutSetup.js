// setup scene for workout
var START_POSITION_Z = -1500,
  SPHERE_RADIUS = 50;

var cameraMaxY = 450,
  cameraMinY = 150,
  lastTime = new Date(),
  sphereList = [];

var camera, scene, renderer, effect, sphere, deviceControls;

function init () {
  //  BoxGeometry(width, height, depth, widthSegments, heightSegments,
  //      depthSegments)
  var tunnel = new THREE.BoxGeometry( 400, 600, 1500, 10, 10 );

  var material = new THREE.MeshBasicMaterial({
    color: 0xaffff,
    wireframe: true,
    transparent: true
  })

  var tunnelMesh = new THREE.Mesh( tunnel, material );

  scene = new THREE.Scene();

  tunnelMesh.position.y = 300;

  scene.add( tunnelMesh );

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );

  document.body.appendChild( renderer.domElement );

  effect = new THREE.StereoEffect( renderer );
  effect.eyeSeparation = 10;
  effect.setSize( window.innerWidth, window.innerHeight );

  //

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth /
    window.innerHeight, 1, 2000 );

  camera.position.y = cameraMaxY;
  camera.position.z = 100;

  deviceControls = new THREE.DeviceOrientationControls( camera );

  window.addEventListener( 'resize', onWindowResize, false );

  makeSpheres(2);
  startSpheres();

  addVideoFeed();
}

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

  for (var i = 0; i < numToMake; i++) {
    sphere = new THREE.Mesh( geometry, material );
    sphere.position.z = START_POSITION_Z;
    sphere.position.y = lastY === cameraMaxY ? cameraMinY : cameraMaxY;
    lastY = sphere.position.y;

    scene.add( sphere );
    sphereList[i] = sphere;
  }
}

function startSpheres () {
  var sphereIndex = 0;

  setInterval(function() {
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

    doTween(position, target, sphere, TWEEN.Easing.Circular.Out, 3000);

  }, 2000);
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
        if (dAccel === -200) {

          // if camera not at top, move to top
          if (camera.position.y < cameraMaxY) {
            target.y = cameraMaxY;
            target.z = camera.position.z;

            doTween(position, target, camera, TWEEN.Easing.Circular.Out, 300);

            lastTime = currentTime;
          }

        // acceleration down
        } else if (dAccel === 200) {

          // if camera not at bottom, move to bottom
          if (camera.position.y > cameraMinY) {
            target.y = cameraMinY;
            target.z = camera.position.z;

            // animate camera movement
            doTween(position, target, camera, TWEEN.Easing.Circular.Out, 300);

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
  var startPosition = {
    x: position.x,
    y: position.y,
    z: position.z
  }
  var tween = new TWEEN.Tween(position)
      .to(target, time)
      .onComplete(function() {

        // if sphere and not at start position z
        if (obj.type === "Mesh" && obj.position.z !== START_POSITION_Z) {
          obj.position.z = START_POSITION_Z;
        }
      });

  tween.onUpdate(function() {
    // console.log("is this called");
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

  if (typeof MediaStreamTrack !== "undefined") {
    MediaStreamTrack.getSources(function(sourceInfos) {
      var sourceInfo, media;

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

      // use sourceId to select either front or back camera
      media = { video: { optional: [{ sourceId: videoSource }] } };

      getUserMedia(media, function(stream) {
        var url = window.URL.createObjectURL(stream);

        videoLeft.src = url;
        videoLeft.play();

        videoRight.src = url;
        videoRight.play();

      }, errBack);
    });
  }

}

function distance(p1, p2) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

function checkForCollision () {
  var target = { x: 0, y: 0, z: START_POSITION_Z },
    sphere;

  for (var i = 0; i < sphereList.length; i++) {
    sphere = sphereList[i];

    // collision
    if (distance(camera.position, sphere.position) <= SPHERE_RADIUS) {
      target.y = sphere.position.y;
      doTween(sphere.position, target, sphere, TWEEN.Easing.Circular.Out, 5000);
    }
  }
}

init();
animate();
initGyro();
