// sensorData.js
// retrieving acceleration data
window.onload = function() {
  var xA = document.getElementById("xA"),
    inpLabel = document.getElementById("inpLabel"),
    btnStartStop = document.getElementById("startStop"),
    spnJson = document.getElementById("json");

  var lastVelocity = false,
    lastPosition = 0,
    timeStep,
    lastT = new Date(),
    label,
    //  {
    //    up: [
    //      [ accl, accl ],
    //      [ accl, accl ]
    //    ],
    //    down: [
    //      [ accl, accl ],
    //      [ accl, accl ]
    //    ]
    //  }
    //
    //  {
    //    movements: [{
    //      type: 'up',
    //      list: [ accl, accl ]
    //    },{
    //      type: 'up',
    //      list: [ accl, accl ]
    //    },{
    //      type: 'down',
    //      list: [ accl, accl ]
    //    },{
    //      type: 'up',
    //      list: [ accl, accl ]
    //    }]
    //  }
    //
    measurements = {},
    values = [];


  btnStartStop.onclick = function(e) {
    label = inpLabel.value;

    if (label.length > 0) {

      if (e.target.innerHTML === "Start") {
        startTracking();
        e.target.innerHTML = "Stop"

      } else {
        stopTracking();
        e.target.innerHTML = "Start"
      }

    } else {
      alert("please enter a label");
    }
  }

  // initialize gyro from gyro.js
  function initGyro() {
    // set frequency of measurements in milliseconds
    // some more comments
    gyro.frequency = 10;
  }

  function startTracking () {
    gyro.startTracking(function(o) {
      var a = o.x.toFixed(5);

      xA.innerHTML = a;

      tracking = true;

      values.push(a);
    });
  }

  function stopTracking () {
    gyro.stopTracking();
    tracking = false;

    if (typeof measurements[label] == "undefined") {
      measurements[label] = [];
    }
    measurements[label].push(values);
    values = [];
    spnJson.innerHTML = JSON.stringify(measurements);
  }
  initGyro();

}
