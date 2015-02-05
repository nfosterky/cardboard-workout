;(function(){
  var camera, scene, renderer, box;

  window.onload = function() {
    var tweetElement,
    tweetObject,
    tweet;

    if (typeof data !== undefined) {
      var ELEM_WIDTH = 10,
        ELEM_HEIGHT = 10,
        ELEM_DEPTH = 10;

      var isFullscreen = false;

      camera = new THREE.PerspectiveCamera( 40, window.innerWidth /
          window.innerHeight, 1, 10000 );

      camera.position.x = 0;
      camera.position.y = 0;
      camera.position.z = 300;

      scene = new THREE.Scene();

      light = new THREE.DirectionalLight( 0xffffff );
      light.position.set( 0, 0, 1 );
      scene.add( light );

      var geometry = new THREE.BoxGeometry( 10, 10, 10 );

      var material = new THREE.MeshBasicMaterial( {
        color: "0xaaff99",
        wireframe: true
      });

      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.getElementById('container').appendChild( renderer.domElement );

      window.addEventListener( 'touchend', function () {

        if ( isFullscreen === false ) {

          document.body.webkitRequestFullscreen();

          isFullscreen = true;

        } else {

          document.webkitExitFullscreen();

          isFullscreen = false;

        }

      } );

      window.addEventListener( 'resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
      }, false );

      animate();

    }

    function animate() {

      // requestAnimationFrame( animate );

      // controls.update();
      render();
    }

    function render() {
      renderer.render( scene, camera );
    }

  }

})();
