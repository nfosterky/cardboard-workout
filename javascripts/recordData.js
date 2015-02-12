// sensorData.js
// retrieving acceleration data
window.onload = function() {
  console.log("loaded");
  var xA = document.getElementById("xA"),
    inpLabel = document.getElementById("inpLabel"),
    btnStartStop = document.getElementById("startStop");

  var lastVelocity = false,
    lastPosition = 0,
    timeStep,
    lastT = new Date(),
    values = [];

  // initialize gyro from gyro.js
  function initGyro() {
    // set frequency of measurements in milliseconds
    // some more comments
    gyro.frequency = 10;


  }
}

function startTracking () {
  gyro.startTracking(function(o) {
    var a = o.x.toFixed(5);

    tracking = true;

    values.push(a);
  });
}

function stopTracking () {
  gyro.stopTracking();
  tracking = false;
}
initGyro();
