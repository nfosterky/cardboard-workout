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
  label, min, max,
  accels = [],
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

  var threshold = 3,
    numAccelsToAverage = 6;

  var thresholdCount = 0;

  function average (list) {
    var avg = 0,
      sum = 0;

    for (var i = 0; i < list.length; i++) {
      sum += parseFloat(list[i]);
    }

    return sum / list.length;
  }

  function getRollingAverage () {
    var numAccels = accels.length,
      sIndex = numAccels - numAccelsToAverage,
      eIndex = numAccels - 1,
      accelsInRange = accels.slice(sIndex, eIndex);

    console.log(accelsInRange);

    return average(accelsInRange);
  }

  var recording = false;

  function startTracking () {
    gyro.startTracking(function(o) {
      var a = parseFloat(o.x.toFixed(5));

      xA.innerHTML = a;

      accels.push(a);

      if (a < threshold || a > -threshold) {
        thresholdCount++;

      } else {
        threshold = 0;
      }

      var rollingAverage = getRollingAverage();

      if (!recording && rollingAverage > threshold ||
          rollingAverage < -threshold) {

        // motion started

        // startRecording
        recording = true;
      }

      if (recording) {
        values.push(a);

        if (a > max) {
          max = a;

        } else if (a < min) {
          min = a;
        }
      }

      if (thresholdCount > 30 && recording) {
        var movement = new Movement(min, max, values);

        // motion stopped
        thresholdCount = 0;

        recording = false;
        min = 0;
        max = 0;
        values = [];
        console.log(movement);
        movement.normalize();
        console.log(movement);
        // normalize values
        // if training save to measurements object
        // if production -> send to NN
      }

    });
  }

  function stopTracking () {
    gyro.stopTracking();

    if (typeof measurements[label] == "undefined") {
      measurements[label] = [];
    }

    measurements[label].push(values);
    values = [];
    spnJson.innerHTML = JSON.stringify(measurements);
  }

  initGyro();

  var Movement = function (min, max, list) {
    this.min = min ? min : 0;
    this.max = max ? max : 0;
    this.list = list ? list : [];
  }

  Movement.prototype.normalize = function () {
    this.max += Math.abs(this.min);

    var range = this.max,
      normalized = [],
      a;

    console.log(range);

    for (var i = 0; i < this.list.length; i++) {
      a = this.list[i] + Math.abs(this.min);
      normalized[i] = a / range;
    }

    this.normalizedList = normalized;
  }

}
