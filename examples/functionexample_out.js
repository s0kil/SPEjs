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

//y is known at the environment as 3.
function foo(x, y, z) {
  return x + 3 + z;
}
