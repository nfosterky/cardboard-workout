

  var camera, scene, renderer;
  var mesh;

  var lastVelocity = 0,
      lastTime = new Date(),
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



    function velocity (lastVelocity, acceleration, timeStep) {
      return lastVelocity + (acceleration * timeStep);
    }

    function position (lastPosition, lastVelocity, acceleration, timeStep) {
      return lastPosition + lastVelocity * timeStep + (0.5 * acceleration * timeStep * timeStep);
    }

    function initGyro() {
      console.log("start tracking");
      gyro.startTracking(function(o) {
        var yAcceleration = o.y.toFixed(3),
          needsRender = false,
          currentTime = new Date(),
          timeStep = currentTime - lastTime;

        lastVelocity = velocity(lastVelocity, yAcceleration, timeStep);
        lastPosition = position(lastPosition, lastVelocity, yAcceleration, timeStep);
        console.log("Velocity: " + lastVelocity);
        console.log("Position: " + lastPosition);
        lastTime = currentTime;

        // if (newY <= 400 && newY >= -400) {
        //   mesh.position.y = newY;
        //   needsRender = true;
        // }

        if (needsRender) {
          renderer.render( scene, camera );
          console.log(mesh.position.y);
        }

        // console.log(mesh.position.x);

        // o.z
        // o.alpha
        // o.beta
        // o.gamma
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
