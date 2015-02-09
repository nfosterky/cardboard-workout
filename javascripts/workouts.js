

  var camera, scene, renderer;
  var mesh;

  var lastVelocity = 0,
      lastTime = false,
      lastPosition = 0;

  init();
  animate();
  initGyro();

  function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth /
      window.innerHeight, 1, 1000 );
      camera.position.z = 600;

      scene = new THREE.Scene();

      var geometry = new THREE.BoxGeometry( 200, 200, 200 );

      var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );
      texture.anisotropy = renderer.getMaxAnisotropy();

      var material = new THREE.MeshBasicMaterial( { map: texture } );

      mesh = new THREE.Mesh( geometry, material );
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
      console.log("lastPosition: " + lastPosition);
      console.log("lastVelocity: " + lastVelocity);
      console.log("timeStep: " + timeStep);
      console.log("acceleration: " + acceleration);

      return lastPosition + lastVelocity * timeStep +
          (0.5 * acceleration * timeStep * timeStep);
    }



    function initGyro() {
      console.log("start tracking");
      gyro.frequency = 10;

      // some comments
      gyro.startTracking(function(o) {
        var yNoiseUpper = 0.2,
          yNoiseLower = -0.2;

        if (parseFloat(o.y.toFixed(2)) >= yNoiseUpper ||
            parseFloat(o.y.toFixed(2)) <= yNoiseLower) {

          if (parseFloat(o.y.toFixed(2)) >= yNoiseUpper) {

          }
          var yAcceleration = o.y.toFixed(3),
          needsRender = false,
          currentTime = new Date(),

          // dividing by 1000 to decrease velocity by 1000 and position by
          // 100000
          // time is in seconds
          if (!lastTime) {
            lastTime = currentTime;
          }
          timeStep = (currentTime - lastTime) / 1000;
          lastTime = currentTime;
          // console.log("y-acceleration: "  + yAcceleration);

          lastVelocity = velocity(lastVelocity, yAcceleration, timeStep);
          lastPosition = position(lastPosition, lastVelocity, yAcceleration, timeStep);
          // console.log("Velocity: " + lastVelocity);
          // console.log("Position: " + lastPosition);


          // if (newY <= 400 && newY >= -400) {
          //   mesh.position.y = newY;
          //   needsRender = true;
          // }

          if (needsRender) {
            renderer.render( scene, camera );
            console.log(mesh.position.y);
          }

          // o.z
          // o.alpha
          // o.beta
          // o.gamma
        }

        if (parseFloat(o.x.toFixed(1)) >= 0.5) {
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
