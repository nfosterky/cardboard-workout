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

    function initGyro() {
      console.log("start tracking");
      gyro.startTracking(function(o) {
        var x = o.x.toFixed(3),
          y = o.y.toFixed(3),
          needsRender = false;

        // f.innerHTML = gyro.getFeatures();
        // console.log(x);
        console.log(y);

        // if (mesh.position.x !== x) {
        //   mesh.position.x += x;
        //   needsRender = true;
        // }

        if (mesh.position.y !== y) {
          mesh.position.y += parseFloat(y) * 1.5;
          needsRender = true;
        }

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
