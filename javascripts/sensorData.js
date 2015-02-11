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

  function initGyro() {
    var listYAccelerations = [],
      noise = false,
      lastXA = false;

    gyro.frequency = 100;

    gyro.startTracking(function(o) {
      var a = o.x.toFixed(3),
        t = new Date(),
        timestep = t - lastT;

      lastT = t;
      lastPosition = position(lastPosition, lastVelocity, acceleration,
          timestep);

      lastVelocity = velocity(lastVelocity, a, timestep);

      xA.innerHTML = a;
      xV.innerHTML = lastVelocity;
      xP.innerHTML = lastPosition;
    });
  }

  initGyro();
}
