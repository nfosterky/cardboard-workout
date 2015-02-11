// sensorData.js
// retrieving acceleration data
window.onload = function() {
  console.log("loaded");
  var xA = document.getElementById("xA"),
    xV = document.getElementById("xV");
    xP = document.getElementById("xP");

  var lastVelocity = false,
    lastPosition = 0,
    timeStep,
    lastT = new Date();


  function velocity (lastVelocity, acceleration, timeStep) {
    return lastVelocity + (acceleration * timeStep);
  }

  function position (lastPosition, lastVelocity, acceleration, timeStep) {
    return lastPosition + lastVelocity * timeStep +
    (0.5 * acceleration * timeStep * timeStep);
  }


  // initialize gyro from gyro.js
  function initGyro() {
    var listYAccelerations = [],
      noise = false,
      lastXA = false;

    // set frequency of measurements in milliseconds
    // some more comments
    gyro.frequency = 100;

    gyro.startTracking(function(o) {
      var a = o.x.toFixed(3),
        t = new Date(),
        timestep = t - lastT;

      if (parseFloat(a) <= 0.1 && parseFloat(a) >= -0.1) {
        a = 0;
        lastVelocity = 0;
      }

      lastT = t;
      lastPosition = position(lastPosition, lastVelocity, a,
        timestep);

      lastVelocity = velocity(lastVelocity, a, timestep);

      xA.innerHTML = a;
      xV.innerHTML = lastVelocity;
      xP.innerHTML = lastPosition;
    });
  }

  initGyro();
}
