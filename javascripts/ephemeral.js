// ephemeral.js
// scene where glitchy controls thrive

var SCENE_HEIGHT = 1000;

// create scene, camera, one plane, light,
var camera, scene, renderer, deviceControls, ground;

function init() {
  var plane, light, groundTexture;

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth /
      window.innerHeight, 1, 2000 );

	camera.position.set( 0, 200, 800 );

  deviceControls = new THREE.DeviceOrientationControls( camera );

	scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

  scene.add( new THREE.AmbientLight( 0x666666 ) );

  var light = new THREE.PointLight( 0xaaddaa, .5 );
  light.position.set( 50, 1200, -500 );
  scene.add( light );

  groundTexture = THREE.ImageUtils.loadTexture(
      "textures/moon.png" );

  // groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  // groundTexture.repeat.set( 432, 432 );
  groundTexture.anisotropy = 16;

  var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff,
      specular: 0x111111, map: groundTexture } );

	ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10000, 10000 ),
      groundMaterial );

	ground.position.y = 10;
	ground.rotation.x = -Math.PI / 2;
  camera.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add( ground );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  startBalloons();
}

function animate() {

  requestAnimationFrame( animate );

  deviceControls.update();

  TWEEN.update();

  renderer.render( scene, camera );

}

function startBalloons () {
  setInterval(function() {

    if (balloons.length < 50) {
      makeBalloon({
        x: 2000 * Math.random() - 1000,
        y: 0, //-200,
        z: 2000 * Math.random() - 1000
      });

    } else {
      resetBalloon();
    }

  }, 500);
}

var balloons = [];

/*
 *  make new balloon
 *  setBalloon()
 */
function makeBalloon (pos) {
  // make sphere
  var geometry = new THREE.SphereGeometry(15, 10, 10)
  groundTexture = THREE.ImageUtils.loadTexture(
      "textures/moon.png" );
  // TODO: random color
  var material = new THREE.MeshPhongMaterial({
    color: 0xaff00,
    map: groundTexture
  })

  var mesh = new THREE.Mesh( geometry, material );

  mesh.position.set(pos.x, pos.y, pos.z);

  balloons.push(mesh);

  scene.add(mesh);

  // tween up to top position
  var target = {
    x: pos.x,
    y: SCENE_HEIGHT,
    z: pos.z
  };

  doTween(pos, target, mesh, TWEEN.Easing.Cubic.In, 25000)
}

var lastBalloonReset = 0;

function resetBalloon () {
  var b, pos, target;

  for (var i = lastBalloonReset; i < balloons.length; i++) {
    b = balloons[i];

    if (b.position.y === SCENE_HEIGHT) {
      target = {
        x: b.position.x,
        y: b.position.y,
        z: b.position.z
      };
      pos = {
        x: b.position.x,
        y: 0,
        z: b.position.z
      };

      doTween(pos, target, b, TWEEN.Easing.Cubic.In, 25000)
      break;
    }

    if (i + 1 === balloons.length) {
      lastBalloonReset = 0;
    }
  }
}

// animate item from start position, to target,
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


init();
animate();
