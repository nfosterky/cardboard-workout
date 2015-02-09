;(function(){

  var camera, scene, renderer;
  var mesh;

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

    var lastVelocity = 0,
      lastTime = new Date();

    function velocity (lastVelocity, acceleration) {
      var currentTime = new Date(),
          velocity = lastVelocity + (acceleration * (currentTime - lastTime));

      lastTime = currentTime;
      lastVelocity = velocity;
      return velocity;
    }

    function initGyro() {
      console.log("start tracking");
      gyro.startTracking(function(o) {
        var x = o.x.toFixed(3),
          yAcceleration = o.y.toFixed(3),
          needsRender = false;

        console.log(velocity(lastVelocity, yAcceleration));


        //
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
})();
