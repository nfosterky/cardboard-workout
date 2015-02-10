  var camera, scene, renderer;
  var mesh;

  var lastVelocity = 0,
      lastTime = false,
      lastPosition = 0;

  init();
  animate();
  initGyro();

  function init() {
    var geometry = new THREE.BoxGeometry( 200, 200, 400 );

    var material = new THREE.MeshBasicMaterial({
      color: 0xaff00,
      wireframe: true
    });

    mesh = new THREE.Mesh( geometry, material );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth /
        window.innerHeight, 1, 1000 );

    camera.position.z = 800;

    //

    scene = new THREE.Scene();
    scene.add( mesh );

    //

    window.addEventListener( 'resize', onWindowResize, false );

  }

  // acceleration is in (meters/second)^2
  // timestep is in seconds
  function velocity (lastVelocity, acceleration, timeStep) {
    return lastVelocity + (acceleration * timeStep);
  }

  function position (lastPosition, lastVelocity, acceleration, timeStep) {
    return lastPosition + lastVelocity * timeStep +
        (0.5 * acceleration * timeStep * timeStep);
  }

  function initGyro() {
    var listYAccelerations = [],
      noise = false;

    gyro.frequency = 1000;

    function trackAxis(axis) {
    }

    function calibrateNoise(axis) {
    }

    // some comments
    gyro.startTracking(function(o) {
      var yAcceleration = o.y.toFixed(3),
        needsRender = false,
        currentTime = new Date(),
        sum;

      console.log("gyro");

      if (listYAccelerations.length <= 100) {
        listYAccelerations.push(yAcceleration);

      } else if (listYAccelerations.length > 100) {

        if (noise === false) {
          sum = 0;

          for (var i = 0; i < listYAccelerations.length; i++) {
            sum += parseFloat(listYAccelerations[i]);
          }

          noise = sum / 100;
          // calibration done
        }

        // dividing by 1000 to decrease velocity by 1000 and position by
        // 100000
        // time is in seconds
        // if there is no last time
        // or if last time is greater than frequency
        if (lastTime && lastTime <= (gyro.frequency * 2) / 1000) {
          timeStep = (currentTime - lastTime) / 1000;
          lastTime = currentTime;

        } else {
          lastTime = currentTime;
          timeStep = (currentTime - lastTime) / 1000;
        }

        yAcceleration -= noise;

        if (yAcceleration <= 0.05 &&
            yAcceleration >= -0.05) {

          yAcceleration = 0;
        }
        console.log("lastPosition: " + lastPosition);
        console.log("lastVelocity: " + lastVelocity);
        console.log("timeStep: " + timeStep);
        console.log("acceleration: " + yAcceleration);

        lastVelocity = velocity(lastVelocity, yAcceleration, timeStep);
        lastPosition = position(lastPosition, lastVelocity, yAcceleration,
            timeStep);

        // if (newY <= 400 && newY >= -400) {
        //   mesh.position.y = newY;
        //   needsRender = true;
        // }
        // if (needsRender) {
        //   renderer.render( scene, camera );
        //   console.log(mesh.position.y);
        // }

      }

      if (parseFloat(o.x.toFixed(1)) >= 0.5 ||
          parseFloat(o.x.toFixed(1)) <= -0.5) {
        console.log("x-acceleration: "  + o.x.toFixed(3));
      }

      if (parseFloat(o.z.toFixed(1)) >= 9.8) {
        console.log("z-acceleration: "  + o.z.toFixed(3));
      }
    });
  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function animate() {

    requestAnimationFrame( animate );

    renderer.render( scene, camera );

  }
