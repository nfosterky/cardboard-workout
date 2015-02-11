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
    return lastVelocity + (acceleration * timeStep) / 1000;
  }

  function position (lastPosition, lastVelocity, acceleration, timeStep) {
    return lastPosition + lastVelocity * timeStep +
    (0.5 * acceleration * timeStep * timeStep);
  }


  var values = [];

  function smooth (value, range) {
    var numValues = values.length,
      valuesToAverage,
      startIndex, endIndex,
      sum = 0;

    startIndex = numValues - range;
    endIndex = numValues - 1;

    valuesToAverage = values.slice(startIndex, endIndex);

    for (var i = 0; i < valuesToAverage.length; i++) {
      sum += parseFloat(valuesToAverage[i]);
    }

    return sum / range;
  }

  // initialize gyro from gyro.js
  function initGyro() {
    var listYAccelerations = [],
    noise = false,
    lastXA = false;

    // set frequency of measurements in milliseconds
    // some more comments
    gyro.frequency = 10;

    gyro.startTracking(function(o) {
      var a = o.x.toFixed(3),
        t = new Date(),
        timestep = t - lastT,
        range = 10;

      var smoothedA;

      // if (parseFloat(a) <= 0.1 && parseFloat(a) >= -0.1) {
      //   a = 0;
      //   lastVelocity = 0;
      // }
      // some comments
      if (values.length >= range) {

        smoothedA = smooth(a, range);

        if (parseFloat(smoothedA) <= 0.1 && parseFloat(smoothedA) >= -0.1) {
          smoothedA = 0;
          lastVelocity = 0;
        }

        lastT = t;
        lastPosition = position(lastPosition, lastVelocity, smoothedA,
          timestep);

          lastVelocity = velocity(lastVelocity, smoothedA, timestep);

          xA.innerHTML = smoothedA;
          xV.innerHTML = lastVelocity;
          xP.innerHTML = lastPosition;

        }
        values.push(a);
      });
    }

    initGyro();
  }
