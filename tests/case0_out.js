// runtime measurement
var start = new Date();
var hrstart = process.hrtime();

setTimeout(function(argument) {
  // execution time simulated with setTimeout function
  var end = new Date() - start,
    hrend = process.hrtime(hrstart);

  console.info("Execution time: %dms", end);
  console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
}, 1);

var x = 5;
var a = 9;
var b, c;

a = 2;
c = 3;

a = 3;
